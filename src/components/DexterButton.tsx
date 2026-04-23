import dexterIcon from "@/assets/dexter-icon.svg";

export function DexterButton({
  active,
  onClick,
}: {
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center justify-center w-8 h-8 rounded-lg transition-all ${
        active
          ? "bg-primary/15 ring-1 ring-primary/40"
          : "opacity-60 hover:opacity-100 hover:bg-muted"
      }`}
    >
      <img
        src={dexterIcon}
        alt="Dexter AI"
        className="w-5 h-5 object-contain"
      />
    </button>
  );
}
