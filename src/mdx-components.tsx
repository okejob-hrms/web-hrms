import type { ComponentProps } from 'react';
import type { StaticImageData } from 'next/image';
import { useMDXComponents as getThemeComponents } from 'nextra-theme-docs';
import { MobileScreenshot } from './app/docs/components/MobileScreenshot';

const themeComponents = getThemeComponents();
const ThemeImage = themeComponents.img;

type ThemeImageProps = ComponentProps<typeof ThemeImage>;

function getImageSrc(src: ThemeImageProps['src']): string | undefined {
  if (typeof src === 'string') {
    return src;
  }

  if (src && typeof src === 'object') {
    if ('default' in src) {
      const defaultExport = src.default as { src?: string } | undefined;
      if (defaultExport?.src) {
        return defaultExport.src;
      }
    }

    if ('src' in src && typeof src.src === 'string') {
      return src.src;
    }
  }

  return undefined;
}

function isMobileScreenshot(
  resolvedSrc: string | undefined,
  alt: string | undefined,
  width: ThemeImageProps['width'],
  height: ThemeImageProps['height'],
): boolean {
  if (alt?.startsWith('Mobile:')) {
    return true;
  }

  if (resolvedSrc?.includes('/manual/mobile/')) {
    return true;
  }

  if (resolvedSrc?.includes('/static/media/mobile-')) {
    return true;
  }

  if (width === 1080 && height === 2400) {
    return true;
  }

  return false;
}

function DocsImage(props: ThemeImageProps) {
  const resolvedSrc = getImageSrc(props.src);

  if (isMobileScreenshot(resolvedSrc, props.alt, props.width, props.height)) {
    return (
      <MobileScreenshot
        src={props.src as string | StaticImageData}
        alt={props.alt ?? ''}
      />
    );
  }

  return <ThemeImage {...props} />;
}

export function useMDXComponents(components: Record<string, unknown>) {
  return {
    ...themeComponents,
    img: DocsImage,
    MobileScreenshot,
    ...components,
  };
}
