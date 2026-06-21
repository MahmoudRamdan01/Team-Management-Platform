/**
 * Cinemagraph backdrop: the cropped Air Ocean Line hero photo
 * (public/images/login-scene.png) with subtle animated light layers on top — a
 * slow ken-burns drift, twinkling stars, a lighthouse beam shimmer, water
 * shimmer and a travelling road/headlight glow. Pure CSS (see auth.css),
 * reduced-motion aware.
 */
export function LoginScene() {
  return (
    <div className="ls-scene" aria-hidden="true">
      <div className="ls-photo" />
      <div className="ls-stars" />
      <div className="ls-beam" />
      <div className="ls-water" />
      <div className="ls-truck" />
      <div className="ls-road" />
      <div className="ls-scrim" />
    </div>
  );
}
