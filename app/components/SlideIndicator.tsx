interface SlideIndicatorProps {
  count: number;
  active: number;
  onSelect: (index: number) => void;
  inactiveClass?: string;
}

export default function SlideIndicator({
  count,
  active,
  onSelect,
  inactiveClass = 'bg-white/10 hover:bg-white/20',
}: SlideIndicatorProps) {
  return (
    <div className="flex gap-3">
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          className={`w-12 h-1 rounded-full transition-all duration-300 ${
            i === active ? 'bg-mx-orange' : inactiveClass
          }`}
          aria-label={`Slide ${i + 1}`}
        />
      ))}
    </div>
  );
}
