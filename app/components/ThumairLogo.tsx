import logo from '../assets/logo.png';
export function ThumairLogo({ className = "size-10" }: { className?: string }) {
  return (
    <img
      src={logo}
      alt="Thumair Logo"
      className={className}
    />
  );
}

export function ThumairLogoWithText({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <ThumairLogo className="size-12" />
      <div className="flex flex-col">
        <span className="text-2xl font-bold" style={{ color: '#0C4A6E' }}>ثمير</span>
        <span className="text-xs" style={{ color: '#10B981' }}>ربط .. تمكين .. استدامة</span>
      </div>
    </div>
  );
}
