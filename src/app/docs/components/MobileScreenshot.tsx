import Image, { type StaticImageData } from 'next/image';

const MOBILE_SCREENSHOT_MAX_WIDTH_PX = 280;

type MobileScreenshotProps = {
  src: string | StaticImageData;
  alt: string;
};

/**
 * Constrains portrait mobile app screenshots to a phone-like width
 * while preserving the source aspect ratio.
 */
export function MobileScreenshot({ src, alt }: MobileScreenshotProps) {
  return (
    <figure
      className="mobile-screenshot"
      style={{
        display: 'block',
        maxWidth: MOBILE_SCREENSHOT_MAX_WIDTH_PX,
        marginInline: 'auto',
        marginBlock: '1.25em',
      }}
    >
      <Image
        src={src}
        alt={alt}
        width={1080}
        height={2400}
        sizes={`${MOBILE_SCREENSHOT_MAX_WIDTH_PX}px`}
        style={{
          display: 'block',
          width: '100%',
          height: 'auto',
          maxWidth: MOBILE_SCREENSHOT_MAX_WIDTH_PX,
        }}
      />
    </figure>
  );
}
