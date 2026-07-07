import { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { contentApi } from "@/lib/contentApi";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Pencil, Save } from "lucide-react";
import { useProductsBySlug, type Product, type ProductMetadata, type PricingOption } from "@/hooks/useProducts";
import { RepeatableListField, StringListField } from "@/components/admin/RepeatableListField";
import ImageUploadField from "@/components/admin/ImageUploadField";
import terapeutaImg from "@/assets/terapeuta.jpg";

const PRODUCT_SLUGS = [
  "sesion-presencial", "sesion-online", "pack-4-sesiones",
  "membresia-online", "membresia-presencial",
  "curso-completo", "despertar-maestria", "viaje-interior",
];

const COURSE_SLUGS = ["curso-completo", "despertar-maestria", "viaje-interior"];

const emptyPricing: PricingOption = { label: "", amount: 0 };
const emptyTimeline: { step: string; detail: string } = { step: "", detail: "" };
const emptyFaq: { q: string; a: string } = { q: "", a: "" };
const emptyDate: { label: string; value: string } = { label: "", value: "" };

const ProductEditor = ({ product, onClose }: { product: Product; onClose: () => void }) => {
  const queryClient = useQueryClient();
  const isCourse = COURSE_SLUGS.includes(product.slug);

  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description || "");
  const [price, setPrice] = useState(product.price);
  const [metadata, setMetadata] = useState<ProductMetadata>(product.metadata || {});

  const save = useMutation({
    mutationFn: async () => {
      await contentApi.saveProduct(product.slug, { name, description, price, metadata });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products-by-slug"] });
      queryClient.invalidateQueries({ queryKey: ["product-by-slug"] });
      toast.success("Producto actualizado");
      onClose();
    },
    onError: (err: any) => toast.error("Error: " + err.message),
  });

  const promo = metadata.promo || { enabled: false };

  return (
    <div className="space-y-5">
      <div>
        <Label>Nombre</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <Label>Descripción</Label>
        <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div>
        <Label>Precio base (€)</Label>
        <Input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
      </div>

      {isCourse && (
        <>
          <div>
            <Label>Subtítulo</Label>
            <Input value={metadata.subtitle || ""} onChange={(e) => setMetadata({ ...metadata, subtitle: e.target.value })} />
          </div>
          <div>
            <Label>Distintivo (badge)</Label>
            <Input value={metadata.badge || ""} onChange={(e) => setMetadata({ ...metadata, badge: e.target.value })} />
          </div>
          <ImageUploadField
            label="Imagen del curso"
            value={metadata.image_url}
            fallbackSrc={terapeutaImg}
            onChange={(url) => setMetadata({ ...metadata, image_url: url })}
          />
        </>
      )}

      <RepeatableListField
        label="Tramos de precio"
        items={metadata.pricing_options || []}
        onChange={(pricing_options) => setMetadata({ ...metadata, pricing_options })}
        emptyItem={emptyPricing}
        fields={[
          { key: "label", label: "Etiqueta" },
          { key: "amount", label: "Importe (€)", type: "number" },
          { key: "perUnit", label: "Sufijo (ej. /mes)" },
          { key: "note", label: "Nota (ej. Ahorras 50€)" },
          { key: "highlight", label: "Destacar", type: "checkbox" },
        ]}
      />

      {isCourse && (
        <>
          <StringListField
            label="Qué incluye"
            items={metadata.includes || []}
            onChange={(includes) => setMetadata({ ...metadata, includes })}
          />
          <StringListField
            label="Para quién es"
            items={metadata.audience || []}
            onChange={(audience) => setMetadata({ ...metadata, audience })}
          />
          <StringListField
            label="Beneficios"
            items={metadata.benefits || []}
            onChange={(benefits) => setMetadata({ ...metadata, benefits })}
          />
          <RepeatableListField
            label="Estructura / calendario"
            items={metadata.timeline || []}
            onChange={(timeline) => setMetadata({ ...metadata, timeline })}
            emptyItem={emptyTimeline}
            fields={[
              { key: "step", label: "Paso (ej. Octubre)" },
              { key: "detail", label: "Detalle" },
            ]}
          />
          <RepeatableListField
            label="Preguntas frecuentes"
            items={metadata.faqs || []}
            onChange={(faqs) => setMetadata({ ...metadata, faqs })}
            emptyItem={emptyFaq}
            fields={[
              { key: "q", label: "Pregunta" },
              { key: "a", label: "Respuesta", type: "textarea" },
            ]}
          />

          <div className="border border-border rounded-lg p-4 space-y-3">
            <label className="flex items-center gap-2 text-sm font-body font-medium">
              <Checkbox
                checked={!!promo.enabled}
                onCheckedChange={(v) => setMetadata({ ...metadata, promo: { ...promo, enabled: !!v } })}
              />
              Mostrar banner de próximas fechas
            </label>
            {promo.enabled && (
              <>
                <Input
                  placeholder="Texto superior (ej. Próximas fechas de inicio · Reiki Nivel I)"
                  value={promo.eyebrow || ""}
                  onChange={(e) => setMetadata({ ...metadata, promo: { ...promo, eyebrow: e.target.value } })}
                />
                <Input
                  placeholder="Título del banner"
                  value={promo.title || ""}
                  onChange={(e) => setMetadata({ ...metadata, promo: { ...promo, title: e.target.value } })}
                />
                <Textarea
                  placeholder="Texto del banner"
                  value={promo.text || ""}
                  onChange={(e) => setMetadata({ ...metadata, promo: { ...promo, text: e.target.value } })}
                />
                <RepeatableListField
                  label="Fechas"
                  items={promo.dates || []}
                  onChange={(dates) => setMetadata({ ...metadata, promo: { ...promo, dates } })}
                  emptyItem={emptyDate}
                  fields={[
                    { key: "label", label: "Etiqueta (ej. Primera fecha)" },
                    { key: "value", label: "Fecha (ej. 17 de mayo)" },
                  ]}
                />
                <Input
                  placeholder="Texto del botón de inscripción (vacío = sin botón)"
                  value={promo.cta_label || ""}
                  onChange={(e) => setMetadata({ ...metadata, promo: { ...promo, cta_label: e.target.value } })}
                />
                {promo.cta_label && (
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Etiqueta del plan al inscribirse"
                      value={promo.cta_pricing_label || ""}
                      onChange={(e) => setMetadata({ ...metadata, promo: { ...promo, cta_pricing_label: e.target.value } })}
                    />
                    <Input
                      type="number"
                      placeholder="Importe (€)"
                      value={promo.cta_amount || 0}
                      onChange={(e) => setMetadata({ ...metadata, promo: { ...promo, cta_amount: Number(e.target.value) } })}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}

      <Button onClick={() => save.mutate()} disabled={save.isPending}>
        {save.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Guardar cambios
      </Button>
    </div>
  );
};

const AdminContentProducts = () => {
  const { products, isLoading } = useProductsBySlug(PRODUCT_SLUGS);
  const [editing, setEditing] = useState<Product | null>(null);

  if (isLoading) return <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />;

  return (
    <div className="space-y-3 max-w-3xl">
      {products.map((p) => (
        <div key={p.id} className="flex items-center justify-between border border-border rounded-lg p-4">
          <div>
            <p className="font-body font-medium text-sm">{p.name}</p>
            <p className="text-xs text-muted-foreground font-body">{p.slug} · {p.price}€</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setEditing(p)}>
            <Pencil className="w-4 h-4" /> Editar
          </Button>
        </div>
      ))}

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.name}</DialogTitle>
          </DialogHeader>
          {editing && <ProductEditor product={editing} onClose={() => setEditing(null)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminContentProducts;
