/**
 * Cinemagraph login backdrop: the Air Ocean Line hero photo
 * (public/images/login-hero.png) with animated light layers on top — a
 * lighthouse beam, twinkling stars, shimmering water, a blinking plane, port
 * lights, and a truck moving along the coastal road. Pure CSS (see auth.css),
 * reduced-motion aware. A fallback gradient shows until the photo is added.
 */
const HERO_SRC = "/images/login-hero.png";

export function LoginScene() {
  return (
    <div className="ls-scene" aria-hidden="true">
      <div className="ls-photo-fallback" />
      <div className="ls-photo" style={{ backgroundImage: `url('${HERO_SRC}')` }} />

      <div className="ls-stars" />
      <div className="ls-beam" />
      <div className="ls-lamp" />
      <div className="ls-water" />
      <div className="ls-plane">
        <span />
        <span />
      </div>
      <div className="ls-port" />
      <div className="ls-truck" />
      <div className="ls-road" />
      <div className="ls-haze" />
      <div className="ls-scrim" />
    </div>
  );
}
