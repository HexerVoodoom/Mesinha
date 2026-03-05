import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Image as ImageIcon, Tag } from 'lucide-react';
import { ListItem } from '../utils/api';
import { TagSelector } from './TagSelector';
import { toast } from 'sonner';
import primaryButtonBg from "figma:asset/85f171ff8cd9cb4f7140b1d04b0f2e0ecceb0615.png";
import secondaryButtonBg from "figma:asset/75c872bdf2a28b8670edf0ef3851acf422588625.png";

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: Partial<ListItem>) => void;
  category: string;
  allItems: ListItem[];
}

export function AddItemModal({ isOpen, onClose, onAdd, category, allItems }: AddItemModalProps) {
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderFrequency, setReminderFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('yearly');
  const [photoUrl, setPhotoUrl] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [showTagSelector, setShowTagSelector] = useState(false);

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
          
          // Compress to JPEG with 0.7 quality (good balance)
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          
          // Check size (max ~2MB base64)
          if (compressedDataUrl.length > 2800000) {
            // Try with lower quality
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
      // Check original file size
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > 10) {
        toast.error('Imagem muito grande. Máximo 10MB');
        return;
      }

      try {
        toast.info('Comprimindo imagem...');
        const compressed = await compressImage(file);
        
        // Check compressed size
        const compressedSizeMB = compressed.length / (1024 * 1024);
        if (compressedSizeMB > 2) {
          toast.warning('Imagem ainda grande após compressão. Pode haver problemas ao salvar.');
        } else {
          toast.success('Imagem adicionada!');
        }
        
        setPhotoUrl(compressed);
      } catch (error) {
        console.error('Error compressing image:', error);
        toast.error('Erro ao processar imagem');
      }
    }
  };

  const handleSubmit = () => {
    if (!title.trim()) return;

    const newItem: Partial<ListItem> = {
      title,
      comment,
      eventDate: eventDate || null,
      reminderEnabled: category === 'dates' ? true : reminderEnabled,
      reminderFrequency: category === 'dates' ? reminderFrequency : undefined,
      repeatCount: category === 'dates' ? 0 : undefined,
      photo: photoUrl || null,
      tags: tags.length > 0 ? tags : undefined,
      createdBy: 'Você',
    };
    
    // Se for categoria alarm, adicionar campos específicos de lembrete
    if (category === 'alarm') {
      newItem.reminderTime = '08:00';
      newItem.reminderDays = [];
      newItem.reminderForMateus = false;
      newItem.reminderForAmanda = false;
      newItem.reminderActive = false;
    }

    onAdd(newItem);

    // Reset form
    setTitle('');
    setComment('');
    setEventDate('');
    setReminderEnabled(false);
    setReminderFrequency('yearly');
    setPhotoUrl('');
    setTags([]);
  };

  const isDateCategory = category === 'dates';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40"
            style={{ maxWidth: 390, margin: '0 auto' }}
          />

          {/* Close Button */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={onClose}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center"
            style={{ maxWidth: 390 }}
          >
            <X className="w-5 h-5" />
          </motion.button>

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full bg-card rounded-t-3xl z-50 pb-8 border-t-2 border-[#4D989B]/10"
            style={{ 
              maxWidth: 390,
              boxShadow: '0 -4px 20px rgba(77, 152, 155, 0.08), 0 -1px 4px rgba(77, 152, 155, 0.04)'
            }}
          >
            <div className="px-6 py-6">
              <h2 className="text-2xl font-medium mb-6">Adicionar Item</h2>

              {/* Title */}
              <div className="mb-4">
                <label className="text-base font-medium mb-2 block">Título *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Comprar flores"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  autoFocus
                />
              </div>

              {/* Comment */}
              <div className="mb-4">
                <label className="text-base font-medium mb-2 block">Comentário</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Adicione detalhes..."
                  className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  rows={3}
                />
              </div>

              {/* Tags */}
              <div className="mb-4">
                <label className="text-base font-medium mb-2 block flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Tags
                </label>
                <button
                  type="button"
                  onClick={() => setShowTagSelector(true)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-input-background hover:bg-muted/30 transition-colors text-left"
                >
                  {tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {tags.map(tag => (
                        <span 
                          key={tag}
                          className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-sm font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Adicionar tags...</span>
                  )}
                </button>
              </div>

              {/* Date Picker (for dates category) */}
              {isDateCategory && (
                <>
                  <div className="mb-4">
                    <label className="text-base font-medium mb-2 block flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Data do Evento
                    </label>
                    <input
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {/* Reminder Frequency */}
                  <div className="mb-4">
                    <label className="text-base font-medium mb-2 block">
                      Frequência do Lembrete
                    </label>
                    <select
                      value={reminderFrequency}
                      onChange={(e) => setReminderFrequency(e.target.value as 'daily' | 'weekly' | 'monthly' | 'yearly')}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="daily">Diariamente</option>
                      <option value="weekly">Semanalmente</option>
                      <option value="monthly">Mensalmente</option>
                      <option value="yearly">Anualmente</option>
                    </select>
                  </div>
                </>
              )}

              {/* Photo Upload - disponível para todas as categorias */}
              <div className="mb-4">
                <label className="text-base font-medium mb-2 block flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Imagem
                </label>
                <div className="relative">
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-input-background hover:bg-muted/30 transition-colors cursor-pointer flex items-center justify-center gap-2 text-muted-foreground"
                  >
                    <ImageIcon className="w-5 h-5" />
                    <span>{photoUrl ? 'Foto selecionada' : 'Incluir foto'}</span>
                  </label>
                  {photoUrl && (
                    <div className="mt-3 relative rounded-xl overflow-hidden">
                      <img 
                        src={photoUrl} 
                        alt="Preview" 
                        className="w-full h-48 object-cover rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() => setPhotoUrl('')}
                        className="absolute top-2 right-2 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 px-6">
                <button
                  onClick={onClose}
                  className="flex-1 h-11 relative bg-contain bg-center bg-no-repeat text-foreground font-medium hover:opacity-80 transition-opacity flex items-center justify-center"
                  style={{ backgroundImage: `url(${secondaryButtonBg})` }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!title.trim()}
                  className="flex-1 h-11 relative bg-contain bg-center bg-no-repeat text-white font-medium hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  style={{ backgroundImage: `url(${primaryButtonBg})` }}
                >
                  Salvar
                </button>
              </div>
            </div>
          </motion.div>

          {/* Tag Selector Modal */}
          <TagSelector
            isOpen={showTagSelector}
            onClose={() => setShowTagSelector(false)}
            selectedTags={tags}
            onSaveTags={setTags}
            allItems={allItems}
          />
        </>
      )}
    </AnimatePresence>
  );
}
