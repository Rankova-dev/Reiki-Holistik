import {
  Heart, Brain, Leaf, Compass, Sun, Sparkles, Star, Lock, CreditCard,
  BookOpen, Crown, Mail, ExternalLink, ChevronDown, type LucideIcon,
} from "lucide-react";

export const ICON_MAP: Record<string, LucideIcon> = {
  Heart, Brain, Leaf, Compass, Sun, Sparkles, Star, Lock, CreditCard,
  BookOpen, Crown, Mail, ExternalLink, ChevronDown,
};

export const ICON_NAMES = Object.keys(ICON_MAP);

export function getIcon(name: string | undefined): LucideIcon {
  return (name && ICON_MAP[name]) || Sparkles;
}
