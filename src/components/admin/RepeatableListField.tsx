import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2 } from "lucide-react";

export interface FieldConfig<T> {
  key: keyof T;
  label: string;
  type?: "text" | "number" | "textarea" | "checkbox";
  placeholder?: string;
}

interface RepeatableListFieldProps<T> {
  label: string;
  items: T[];
  onChange: (items: T[]) => void;
  fields: FieldConfig<T>[];
  emptyItem: T;
}

export function RepeatableListField<T extends Record<string, any>>({
  label, items, onChange, fields, emptyItem,
}: RepeatableListFieldProps<T>) {
  const updateItem = (i: number, key: keyof T, value: any) => {
    const next = items.slice();
    next[i] = { ...next[i], [key]: value };
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-2 border border-border rounded-lg p-3">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {fields.map((f) => (
                <div key={String(f.key)} className={f.type === "textarea" ? "sm:col-span-2" : ""}>
                  {f.type === "checkbox" ? (
                    <label className="flex items-center gap-2 text-sm font-body">
                      <Checkbox
                        checked={!!item[f.key]}
                        onCheckedChange={(v) => updateItem(i, f.key, !!v)}
                      />
                      {f.label}
                    </label>
                  ) : f.type === "textarea" ? (
                    <Textarea
                      placeholder={f.placeholder || f.label}
                      value={item[f.key] ?? ""}
                      onChange={(e) => updateItem(i, f.key, e.target.value)}
                    />
                  ) : (
                    <Input
                      type={f.type === "number" ? "number" : "text"}
                      placeholder={f.placeholder || f.label}
                      value={item[f.key] ?? ""}
                      onChange={(e) => updateItem(i, f.key, f.type === "number" ? Number(e.target.value) : e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={() => onChange(items.filter((_, idx) => idx !== i))}>
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...items, emptyItem])}>
        <Plus className="w-4 h-4" /> Añadir
      </Button>
    </div>
  );
}

interface StringListFieldProps {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}

export function StringListField({ label, items, onChange, placeholder }: StringListFieldProps) {
  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              value={item}
              placeholder={placeholder}
              onChange={(e) => {
                const next = items.slice();
                next[i] = e.target.value;
                onChange(next);
              }}
            />
            <Button type="button" variant="ghost" size="icon" onClick={() => onChange(items.filter((_, idx) => idx !== i))}>
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...items, ""])}>
        <Plus className="w-4 h-4" /> Añadir
      </Button>
    </div>
  );
}
