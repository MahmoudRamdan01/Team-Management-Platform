/**
 * Cinemagraph backdrop: the cropped Air Ocean Line hero photo
 * (public/images/login-scene.png) with animated light layers on top. Everything
 * except the scrim sits inside `.ls-pan`, which adds a slow horizontal camera
 * pan (a gentle "sailing" drift) on top of the photo's own ken-burns — so the
 * whole composition glides together and the light overlays stay aligned to the
 * scene. Layers: twinkling stars, a wide sweeping lighthouse beam + a flickering
 * lamp glow, shimmering water with a drifting specular glint, foam lapping the
 * ship's bow, light trails + a travelling headlight glow running up the coastal
 * road (the truck body stays put — only the light moves), a truck headlight
 * pulse and an occasional shooting star. Pure CSS (see auth.css),
 * reduced-motion aware.
 */
export function LoginScene() {
  return (
    <div className="ls-scene" aria-hidden="true">
      <div className="ls-pan">
        <div className="ls-photo" />
        <div className="ls-stars" />
        <div className="ls-beam" />
        <div className="ls-lamp" />
        <div className="ls-water" />
        <div className="ls-water-spec" />
        <div className="ls-foam" />
        <div className="ls-truck" />
        <div className="ls-headlight" />
        <div className="ls-trail" />
        <div className="ls-trail" style={{ animationDelay: "0.65s" }} />
        <div className="ls-trail" style={{ animationDelay: "1.3s" }} />
        <div className="ls-trail" style={{ animationDelay: "1.95s" }} />
        <div className="ls-meteor" />
      </div>
      <div className="ls-scrim" />
    </div>
  );
}
