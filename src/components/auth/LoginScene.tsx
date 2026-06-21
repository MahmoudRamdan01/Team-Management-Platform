/**
 * Cinemagraph backdrop: the cropped Air Ocean Line hero photo
 * (public/images/login-scene.png) with animated light layers on top — a slow
 * ken-burns drift, twinkling stars, a sweeping lighthouse beam, shimmering
 * water, light trails running up the coastal road, a truck headlight pulse and
 * an occasional shooting star. Pure CSS (see auth.css), reduced-motion aware.
 */
export function LoginScene() {
  return (
    <div className="ls-scene" aria-hidden="true">
      <div className="ls-photo" />
      <div className="ls-stars" />
      <div className="ls-beam" />
      <div className="ls-water" />
      <div className="ls-truck" />
      <div className="ls-trail" />
      <div className="ls-trail" style={{ animationDelay: "0.9s" }} />
      <div className="ls-trail" style={{ animationDelay: "1.8s" }} />
      <div className="ls-meteor" />
      <div className="ls-scrim" />
    </div>
  );
}
