import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, X, Image as ImageIcon, CheckCircle, Bell, BellOff } from 'lucide-react';
import { ListItem } from '../utils/api';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';
import { Button } from './ui/Button';
import { TextArea } from './ui/Input';
import { Card, CardContent } from './ui/Card';
import { TagSelector } from './TagSelector';
import { toast } from 'sonner';
import { LazyPhoto } from './LazyPhoto';
import { Checkbox } from './ui/checkbox';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { PhotoViewModal } from './PhotoViewModal';
import { ConfirmationModal } from './ConfirmationModal';
import primaryButtonBg from "figma:asset/85f171ff8cd9cb4f7140b1d04b0f2e0ecceb0615.png";
import secondaryButtonBg from "figma:asset/75c872bdf2a28b8670edf0ef3851acf422588625.png";

interface ListItemComponentProps {
  item: ListItem;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onUpdate: (updates: Partial<ListItem>) => void;
  onDelete: () => void;
  onMarkAsDone: () => void;
  onMarkAsPending?: () => void;
  allItems: ListItem[];
}

export function ListItemComponent({
  item,
  isExpanded,
  onToggleExpand,
  onUpdate,
  onDelete,
  onMarkAsDone,
  onMarkAsPending,
  allItems,
}: ListItemComponentProps) {
  const formattedDate = format(parseISO(item.createdAt), 'd MMM', { locale: ptBR });
  const [tempComment, setTempComment] = useState(item.comment || '');
  const [tempPhoto, setTempPhoto] = useState(item.photo && item.photo !== 'HAS_PHOTO' ? item.photo : '');
  const [showTagSelector, setShowTagSelector] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showPhotoView, setShowPhotoView] = useState(false);
  const [showRemovePhotoConfirm, setShowRemovePhotoConfirm] = useState(false);
  
  // Estados específicos para categoria alarm (lembretes)
  const [tempReminderTime, setTempReminderTime] = useState(item.reminderTime || '08:00');
  const [tempReminderDays, setTempReminderDays] = useState<string[]>(item.reminderDays || []);
  const [tempReminderForMateus, setTempReminderForMateus] = useState(item.reminderForMateus || false);
  const [tempReminderForAmanda, setTempReminderForAmanda] = useState(item.reminderForAmanda || false);
  
  const hasPhoto = item.photo === 'HAS_PHOTO' || (item.photo && item.photo.startsWith('data:'));
  
  const handlePhotoLoaded = (photo: string | null) => {
    if (photo) {
      setTempPhoto(photo);
    }
  };

  const handleSave = () => {
    const updates: Partial<ListItem> = { 
      comment: tempComment, 
      photo: tempPhoto || null 
    };
    
    // Se for categoria alarm, incluir campos específicos de lembrete
    if (item.category === 'alarm') {
      updates.reminderTime = tempReminderTime;
      updates.reminderDays = tempReminderDays;
      updates.reminderForMateus = tempReminderForMateus;
      updates.reminderForAmanda = tempReminderForAmanda;
    }
    
    onUpdate(updates);
  };

  const handleSaveTags = (tags: string[]) => {
    onUpdate({ tags });
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Calculate new dimensions (max 1200px width/height)
          let width = img.width;
          let height = img.height;
          const maxSize = 1200;
          
          if (width > height && width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          } else if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Compress to JPEG with 0.7 quality
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          
          // Check size (max ~2MB base64)
          if (compressedDataUrl.length > 2800000) {
            const lowerQuality = canvas.toDataURL('image/jpeg', 0.5);
            resolve(lowerQuality);
          } else {
            resolve(compressedDataUrl);
          }
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file);
        setTempPhoto(compressed);
        toast.success('Foto comprimida e adicionada!');
      } catch (error) {
        console.error('Error compressing image:', error);
        toast.error('Erro ao processar imagem');
      }
    }
  };

  const isDateCategory = item.category === 'dates';
  const isAlarmCategory = item.category === 'alarm';
  const isJokesCategory = item.category === 'jokes';
  const isOtherCategory = item.category === 'other';
  const isDone = item.status === 'done';
  
  const frequencyLabels = {
    daily: 'Diariamente',
    weekly: 'Semanalmente',
    monthly: 'Mensalmente',
    yearly: 'Anualmente',
  };
  
  const dayLabels: Record<string, string> = {
    mon: 'Seg',
    tue: 'Ter',
    wed: 'Qua',
    thu: 'Qui',
    fri: 'Sex',
    sat: 'Sáb',
    sun: 'Dom',
  };
  
  const allDays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

  return (
    <Card variant="white" className="overflow-visible">
      <CardContent className="p-[18px]">
        {/* Main Row */}
        <div className="flex items-start gap-4">
          {/* Checkbox - não mostrar para categoria dates, jokes (bobeiras) e other (outros) */}
          {!isDateCategory && !isJokesCategory && !isOtherCategory && (
            <button
              onClick={() => {
                if (isAlarmCategory) {
                  // Para categoria alarm: alterna entre ativo/desativado
                  if (!isExpanded) {
                    onUpdate({ reminderActive: !item.reminderActive });
                  }
                } else {
                  // Para outras categorias: marca como feito
                  if (!isExpanded && !isDone) {
                    onMarkAsDone();
                  }
                }
              }}
              className="flex-shrink-0 mt-0.5"
            >
              <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                isAlarmCategory
                  ? (item.reminderActive ? 'border-primary bg-primary' : 'border-[#4D989B]/30 bg-white')
                  : (isDone ? 'border-primary bg-primary' : 'border-[#4D989B]/30 bg-white')
              }`}>
                {((isAlarmCategory && item.reminderActive) || (!isAlarmCategory && isDone)) && (
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </button>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <button
              onClick={onToggleExpand}
              className="w-full text-left"
            >
              <div className={`font-['Quicksand',sans-serif] font-semibold text-base ${
                isDone ? 'line-through text-muted-foreground' : 'text-[#2B2A28]'
              }`}>
                {item.title}
              </div>
              
              {/* Horário do lembrete - aparece entre título e metadados */}
              {isAlarmCategory && item.reminderTime && (
                (() => {
                  const today = new Date().getDay(); // 0 = domingo, 1 = segunda, etc
                  const dayMap: { [key: number]: string } = {
                    0: 'dom',
                    1: 'seg',
                    2: 'ter',
                    3: 'qua',
                    4: 'qui',
                    5: 'sex',
                    6: 'sab'
                  };
                  const todayKey = dayMap[today];
                  const isActiveToday = item.reminderDays?.includes(todayKey) && item.reminderActive;
                  
                  return (
                    <div className={`text-sm mt-1 font-['Quicksand',sans-serif] ${
                      isActiveToday ? 'text-[#2B2A28]' : 'text-[#C5C0BA]'
                    }`}>
                      {item.reminderTime}
                    </div>
                  );
                })()
              )}
              
              {/* Event Date, Reminder Frequency and Repeat Count for dates category */}
              {isDateCategory && (
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  {item.eventDate && (
                    <span className="text-xs text-[#8A847D]">
                      {format(parseISO(item.eventDate), 'd MMM yyyy', { locale: ptBR })}
                    </span>
                  )}
                  {item.reminderFrequency && (
                    <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      🔔 {frequencyLabels[item.reminderFrequency]}
                    </span>
                  )}
                  {item.repeatCount !== undefined && item.repeatCount > 0 && (
                    <span className="text-xs font-medium text-[#2B2A28] bg-[#FFD700]/30 border border-[#FFD700]/50 px-2 py-0.5 rounded-full">
                      🔄 {item.repeatCount}x
                    </span>
                  )}
                </div>
              )}
              
              {/* Reminder info for alarm category */}
              {isAlarmCategory && (
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  {/* Dias da semana */}
                  {item.reminderDays && item.reminderDays.length > 0 && (
                    <span className="text-xs text-[#8A847D]">
                      {item.reminderDays.map(day => dayLabels[day]).join(', ')}
                    </span>
                  )}
                  
                  {/* Para quem */}
                  <div className="flex items-center gap-1">
                    {item.reminderForMateus && (
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        Mateus
                      </span>
                    )}
                    {item.reminderForAmanda && (
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        Amanda
                      </span>
                    )}
                  </div>
                </div>
              )}
              
              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {item.tags.map(tag => (
                    <span 
                      key={tag}
                      className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              {/* Photo Preview - versão fechada */}
              {!isExpanded && hasPhoto && (
                <div 
                  className="mt-3 rounded-xl overflow-hidden cursor-pointer transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPhotoView(true);
                  }}
                >
                  {tempPhoto && tempPhoto.startsWith('data:') ? (
                    <img 
                      src={tempPhoto} 
                      alt={item.title}
                      className="w-full h-40 object-cover"
                    />
                  ) : (
                    <LazyPhoto 
                      itemId={item.id}
                      hasPhoto={hasPhoto}
                      className="w-full h-40 object-cover"
                      alt={item.title}
                      onLoad={handlePhotoLoaded}
                    />
                  )}
                </div>
              )}
              
              {!isExpanded && (
                <div className="font-['Quicksand',sans-serif] text-xs text-[#8A847D] mt-1.5">
                  {item.createdBy} • {formattedDate}
                </div>
              )}
            </button>

            {/* Expanded Content */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  {isDone ? (
                    // Expanded content for completed items
                    <div className="pt-4 space-y-3">
                      {/* Actions for done items */}
                      <div className="flex gap-3 px-2">
                        <button
                          onClick={() => {
                            onMarkAsPending?.();
                            onToggleExpand();
                          }}
                          className="flex-1 h-12 relative bg-contain bg-center bg-no-repeat text-white font-medium transition-opacity text-sm flex items-center justify-center"
                          style={{ backgroundImage: `url(${primaryButtonBg})` }}
                        >
                          Desmarcar
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirmation(true)}
                          className="flex-1 h-12 relative bg-contain bg-center bg-no-repeat text-foreground font-medium transition-opacity text-sm flex items-center justify-center"
                          style={{ backgroundImage: `url(${secondaryButtonBg})` }}
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Expanded content for pending items
                    <div className="pt-3 space-y-3">
                      {/* Repeat Count Display for dates */}
                      {isDateCategory && item.repeatCount !== undefined && item.repeatCount > 0 && (
                        <div className="bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-[#2B2A28]">
                              Total de repetições
                            </span>
                            <span className="text-2xl font-bold text-[#2B2A28]">
                              {item.repeatCount}x
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {/* Campos específicos para categoria alarm (lembretes) */}
                      {isAlarmCategory && (
                        <div className="space-y-4 bg-primary/5 rounded-lg p-4">
                          {/* Checkboxes Mateus e Amanda */}
                          <div className="space-y-2">
                            <label className="font-['Quicksand',sans-serif] text-sm font-medium text-[#2B2A28] block mb-2">
                              Enviar lembrete para:
                            </label>
                            <div className="flex gap-4">
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  id={`mateus-${item.id}`}
                                  checked={tempReminderForMateus}
                                  onCheckedChange={(checked) => setTempReminderForMateus(checked as boolean)}
                                />
                                <label
                                  htmlFor={`mateus-${item.id}`}
                                  className="font-['Quicksand',sans-serif] text-sm text-[#2B2A28] cursor-pointer select-none"
                                >
                                  Mateus
                                </label>
                              </div>
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  id={`amanda-${item.id}`}
                                  checked={tempReminderForAmanda}
                                  onCheckedChange={(checked) => setTempReminderForAmanda(checked as boolean)}
                                />
                                <label
                                  htmlFor={`amanda-${item.id}`}
                                  className="font-['Quicksand',sans-serif] text-sm text-[#2B2A28] cursor-pointer select-none"
                                >
                                  Amanda
                                </label>
                              </div>
                            </div>
                          </div>
                          
                          {/* Time Picker */}
                          <div>
                            <label 
                              htmlFor={`time-${item.id}`}
                              className="font-['Quicksand',sans-serif] text-sm font-medium text-[#2B2A28] block mb-2"
                            >
                              Horário:
                            </label>
                            <input
                              id={`time-${item.id}`}
                              type="time"
                              value={tempReminderTime}
                              onChange={(e) => setTempReminderTime(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-border bg-white text-[#2B2A28] font-['Quicksand',sans-serif]"
                            />
                          </div>
                          
                          {/* Day Selector */}
                          <div>
                            <label className="font-['Quicksand',sans-serif] text-sm font-medium text-[#2B2A28] block mb-2">
                              Dias da semana:
                            </label>
                            <div className="flex gap-2 flex-wrap">
                              {allDays.map(day => {
                                const isSelected = tempReminderDays.includes(day);
                                return (
                                  <button
                                    key={day}
                                    onClick={() => {
                                      if (isSelected) {
                                        setTempReminderDays(tempReminderDays.filter(d => d !== day));
                                      } else {
                                        setTempReminderDays([...tempReminderDays, day]);
                                      }
                                    }}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                                      isSelected
                                        ? 'bg-primary text-white'
                                        : 'bg-white border border-border text-[#8A847D] hover:border-primary'
                                    }`}
                                  >
                                    {dayLabels[day]}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Comment Input */}
                      <TextArea
                        value={tempComment}
                        onChange={(e) => setTempComment(e.target.value)}
                        placeholder="Adicionar um comentário..."
                        rows={2}
                        className="text-sm"
                      />

                      {/* Photo Upload */}
                      <div>
                        <div className="relative">
                          <input
                            id={`photo-upload-${item.id}`}
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="hidden"
                          />
                          <label
                            htmlFor={`photo-upload-${item.id}`}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-input-background hover:bg-muted/30 transition-colors cursor-pointer flex items-center justify-center gap-2 text-muted-foreground text-sm"
                          >
                            <ImageIcon className="w-4 h-4" />
                            <span>{tempPhoto ? 'Alterar foto' : 'Incluir foto'}</span>
                          </label>
                          {(tempPhoto || hasPhoto) && (
                            <div className="mt-2 relative rounded-lg overflow-hidden">
                              {tempPhoto && tempPhoto.startsWith('data:') ? (
                                <>
                                  <img 
                                    src={tempPhoto} 
                                    alt="Preview" 
                                    className="w-full h-32 object-cover rounded-lg"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowRemovePhotoConfirm(true)}
                                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors"
                                  >
                                    <X className="w-3 h-3 text-white" />
                                  </button>
                                </>
                              ) : hasPhoto ? (
                                <LazyPhoto 
                                  itemId={item.id}
                                  hasPhoto={hasPhoto}
                                  className="w-full h-32 object-cover rounded-lg"
                                  alt="Preview"
                                  onLoad={handlePhotoLoaded}
                                />
                              ) : null}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-3 pt-1">
                        {isAlarmCategory ? (
                          // Para categoria alarm: Salvar/Excluir (checkbox controla ativo/desativado)
                          <div className="flex gap-3 px-2">
                            <button
                              onClick={() => {
                                handleSave();
                                onToggleExpand();
                              }}
                              className="flex-1 h-12 relative bg-contain bg-center bg-no-repeat text-white font-medium transition-opacity text-sm flex items-center justify-center"
                              style={{ backgroundImage: `url(${primaryButtonBg})` }}
                            >
                              Salvar
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirmation(true)}
                              className="flex-1 h-12 relative bg-contain bg-center bg-no-repeat text-foreground font-medium transition-opacity text-sm flex items-center justify-center"
                              style={{ backgroundImage: `url(${secondaryButtonBg})` }}
                            >
                              Excluir
                            </button>
                          </div>
                        ) : isDateCategory ? (
                          // Para categoria dates: Checkbox de lembrete + Editar/Excluir
                          <>
                            {/* Checkbox de ativar lembrete */}
                            {item.eventDate && (
                              <div className="flex items-center gap-2 py-1">
                                <Checkbox
                                  id={`reminder-${item.id}`}
                                  checked={!!item.reminderFrequency}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      onUpdate({ reminderFrequency: 'monthly' });
                                      toast.success('Lembrete ativado (mensal)');
                                    } else {
                                      onUpdate({ reminderFrequency: null });
                                      toast.success('Lembrete desativado');
                                    }
                                  }}
                                />
                                <label
                                  htmlFor={`reminder-${item.id}`}
                                  className="font-['Quicksand',sans-serif] text-sm text-[#2B2A28] cursor-pointer select-none flex items-center gap-1.5"
                                >
                                  {item.reminderFrequency ? (
                                    <Bell className="w-4 h-4 text-[#4D989B]" />
                                  ) : (
                                    <BellOff className="w-4 h-4 text-[#8A847D]" />
                                  )}
                                  <span>Ativar lembrete</span>
                                </label>
                              </div>
                            )}
                            
                            {/* Botões de Editar e Excluir */}
                            <div className="flex gap-3 px-2">
                              <button
                                onClick={() => {
                                  handleSave();
                                  onToggleExpand();
                                }}
                                className="flex-1 h-11 relative bg-contain bg-center bg-no-repeat text-white font-medium transition-opacity text-sm flex items-center justify-center"
                                style={{ backgroundImage: `url(${primaryButtonBg})` }}
                              >
                                Salvar
                              </button>
                              <button
                                onClick={() => setShowDeleteConfirmation(true)}
                                className="flex-1 h-11 relative bg-contain bg-center bg-no-repeat text-foreground font-medium transition-opacity text-sm flex items-center justify-center"
                                style={{ backgroundImage: `url(${secondaryButtonBg})` }}
                              >
                                Excluir
                              </button>
                            </div>
                          </>
                        ) : isJokesCategory ? (
                          // Para categoria jokes (bobeiras): Apenas salvar e excluir (sem marcar como concluído)
                          <div className="flex gap-3 px-2">
                            <button
                              onClick={() => {
                                handleSave();
                                onToggleExpand();
                              }}
                              className="flex-1 h-12 relative bg-contain bg-center bg-no-repeat text-white font-medium transition-opacity text-sm flex items-center justify-center"
                              style={{ backgroundImage: `url(${primaryButtonBg})` }}
                            >
                              Salvar
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirmation(true)}
                              className="flex-1 h-12 relative bg-contain bg-center bg-no-repeat text-foreground font-medium transition-opacity text-sm flex items-center justify-center"
                              style={{ backgroundImage: `url(${secondaryButtonBg})` }}
                            >
                              Excluir
                            </button>
                          </div>
                        ) : isOtherCategory ? (
                          // Para categoria other: Apenas salvar e excluir (sem marcar como concluído)
                          <div className="flex gap-3 px-2">
                            <button
                              onClick={() => {
                                handleSave();
                                onToggleExpand();
                              }}
                              className="flex-1 h-12 relative bg-contain bg-center bg-no-repeat text-white font-medium transition-opacity text-sm flex items-center justify-center"
                              style={{ backgroundImage: `url(${primaryButtonBg})` }}
                            >
                              Salvar
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirmation(true)}
                              className="flex-1 h-12 relative bg-contain bg-center bg-no-repeat text-foreground font-medium transition-opacity text-sm flex items-center justify-center"
                              style={{ backgroundImage: `url(${secondaryButtonBg})` }}
                            >
                              Excluir
                            </button>
                          </div>
                        ) : (
                          // Para outras categorias: Salvar (com concluir) e Excluir
                          <div className="flex gap-3 px-2">
                            <button
                              onClick={() => {
                                handleSave();
                                onMarkAsDone();
                                onToggleExpand();
                              }}
                              className="flex-1 h-12 relative bg-contain bg-center bg-no-repeat text-white font-medium transition-opacity text-sm flex items-center justify-center"
                              style={{ backgroundImage: `url(${primaryButtonBg})` }}
                            >
                              Salvar
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirmation(true)}
                              className="flex-1 h-12 relative bg-contain bg-center bg-no-repeat text-foreground font-medium transition-opacity text-sm flex items-center justify-center"
                              style={{ backgroundImage: `url(${secondaryButtonBg})` }}
                            >
                              Excluir
                            </button>
                          </div>
                        )}
                      </div>

                      {/* + Adicionar tag link */}
                      <button 
                        onClick={() => setShowTagSelector(true)}
                        className="font-['Quicksand',sans-serif] text-xs text-[#8A847D] hover:text-[#4D989B] transition-colors flex items-center gap-1"
                      >
                        <span className="text-lg leading-none">+</span>
                        <span>Adicionar tag</span>
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Chevron */}
          <button onClick={onToggleExpand} className="flex-shrink-0 mt-1">
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight className="w-5 h-5 text-[#8A847D]/40" strokeWidth={2.5} />
            </motion.div>
          </button>
        </div>
      </CardContent>

      {/* Tag Selector Modal */}
      <TagSelector
        isOpen={showTagSelector}
        onClose={() => setShowTagSelector(false)}
        selectedTags={item.tags || []}
        onSaveTags={handleSaveTags}
        allItems={allItems}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={onDelete}
        itemTitle={item.title}
      />

      {/* Photo View Modal */}
      <PhotoViewModal
        isOpen={showPhotoView}
        onClose={() => setShowPhotoView(false)}
        photoUrl={tempPhoto || ''}
        title={item.title}
      />

      {/* Remove Photo Confirmation Modal */}
      <ConfirmationModal
        isOpen={showRemovePhotoConfirm}
        onClose={() => setShowRemovePhotoConfirm(false)}
        onConfirm={() => {
          setTempPhoto('');
          toast.success('Foto removida');
        }}
        title="Remover foto?"
        message="Tem certeza que deseja remover esta foto?"
        confirmText="Remover"
        cancelText="Cancelar"
      />
    </Card>
  );
}
