# Login hero image

Place the Air Ocean Line login background here as:

```
public/images/login-hero.png
```

The login page (`src/components/auth/LoginScene.tsx`) uses it as the cinematic
backdrop with animated light layers (lighthouse beam, stars, water shimmer,
plane, port lights, truck). Until this file exists, a navy fallback gradient is
shown automatically — nothing breaks.

Recommended: a wide night-port scene (≈1600×1000 or larger), `.png` or `.jpg`.
If you upload a `.jpg`, update the `HERO_SRC` path in `LoginScene.tsx`.
