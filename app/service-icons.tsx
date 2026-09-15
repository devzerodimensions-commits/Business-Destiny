import {
  Orbit,
  CalendarDays,
  Users,
  Target,
  ChartNoAxesCombined,
  Compass,
  Factory,
  Building2,
  Type,
  MessageSquare,
  CircleCheck,
  Sparkles,
} from 'lucide-react';
export const serviceIcons = {
  orbit: Orbit,
  calendar: CalendarDays,
  people: Users,
  target: Target,
  chart: ChartNoAxesCombined,
  compass: Compass,
  factory: Factory,
  building: Building2,
  type: Type,
  message: MessageSquare,
  check: CircleCheck,
  sparkles: Sparkles,
};
export function ServiceIcon({ name }: { name?: string }) {
  const Icon = serviceIcons[name as keyof typeof serviceIcons] || Sparkles;
  return (
    <span className="detail-card-icon" aria-hidden="true">
      <Icon size={27} strokeWidth={1.5} />
    </span>
  );
}
