export function Background() {
  return (
    <>
      <div className="bg-grid" />
      <div
        className="bg-orb animate-floaty"
        style={{
          width: 520,
          height: 520,
          top: -120,
          left: -80,
          background: "radial-gradient(circle, rgba(34,211,238,0.7), transparent 60%)",
        }}
      />
      <div
        className="bg-orb animate-floaty"
        style={{
          width: 460,
          height: 460,
          top: 120,
          right: -120,
          animationDelay: "-5s",
          background: "radial-gradient(circle, rgba(232,121,249,0.6), transparent 60%)",
        }}
      />
      <div
        className="bg-orb animate-floaty"
        style={{
          width: 420,
          height: 420,
          bottom: -140,
          left: "40%",
          animationDelay: "-9s",
          background: "radial-gradient(circle, rgba(139,92,246,0.55), transparent 60%)",
        }}
      />
      <div className="bg-vignette" />
    </>
  );
}
