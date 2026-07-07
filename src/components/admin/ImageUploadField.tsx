import { useState } from "react";
import { contentApi } from "@/lib/contentApi";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";

interface ImageUploadFieldProps {
  label: string;
  value: string | null | undefined; // current URL (or null = fallback asset)
  fallbackSrc: string;
  onChange: (url: string) => void;
}

const ImageUploadField = ({ label, value, fallbackSrc, onChange }: ImageUploadFieldProps) => {
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const { url } = await contentApi.upload(file);
      onChange(`${url}?v=${Date.now()}`);
      toast.success("Imagen actualizada");
    } catch (err: any) {
      toast.error("Error al subir la imagen: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-4">
        <img src={value || fallbackSrc} alt={label} className="w-20 h-20 rounded-lg object-cover border border-border" />
        <label>
          <Button type="button" variant="outline" size="sm" disabled={uploading} asChild>
            <span className="cursor-pointer">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Reemplazar imagen
            </span>
          </Button>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }}
          />
        </label>
      </div>
    </div>
  );
};

export default ImageUploadField;
