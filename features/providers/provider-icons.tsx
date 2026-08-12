import {
  siAnthropic,
  siDeepseek,
  siGoogle,
  siMistralai,
  siOllama,
  siOpenrouter,
} from "simple-icons";
import type { AIProvider, ProviderIconProps } from "@/types";

interface IconDefinition {
  hex?: string;
  path: string;
  title: string;
}

const OPENAI_PATH =
  "M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0802 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4942zM3.6377 17.5901a4.4755 4.4755 0 0 1-.5351-3.0134l.142.085 4.783 2.7582a.7948.7948 0 0 0 .7854 0l5.8335-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615l-4.8351 2.7914a4.4945 4.4945 0 0 1-6.1405-1.6466zm-1.8042-9.61a4.4755 4.4755 0 0 1 2.341-1.9727v5.682l4.7784-2.7582a.7948.7948 0 0 0 .3927-.6813V1.5794a.071.071 0 0 1 .038-.052 4.4993 4.4993 0 0 1 4.5 4.4942v.0047l-5.8336 3.3685a.7948.7948 0 0 0-.3927.6813v.0047l-5.8241 3.3638a.0757.0757 0 0 1-.038-.052V7.9801zm14.8693-3.6931l-4.7831 2.7582a.7948.7948 0 0 0-.3927.6813v6.7369l-2.02-1.1686a.071.071 0 0 1-.038-.052V7.6601a4.504 4.504 0 0 1 7.3718-3.4533l-.138.0802zM18.835 7.9801a4.4755 4.4755 0 0 1 .5351 3.0134l-.142-.085-4.783-2.7582a.7948.7948 0 0 0-.7854 0L7.8262 11.5188V9.1864a.0804.0804 0 0 1 .0332-.0615l4.8351-2.7914a4.4945 4.4945 0 0 1 6.1405 1.6466zm1.8042 9.61a4.4755 4.4755 0 0 1-2.341 1.9727v-5.682l-4.7784 2.7582a.7948.7948 0 0 0-.3927.6813v6.7369a.071.071 0 0 1-.038.052 4.4993 4.4993 0 0 1-4.5-4.4942v-.0047l5.8336-3.3685a.7948.7948 0 0 0 .3927-.6813v-.0047l5.8241-3.3638a.0757.0757 0 0 1 .038.052v5.342z";

const GROQ_PATH =
  "M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm1 18l-5-6h4V6l5 6h-4v6z";

const TOGETHER_PATH = "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5";

const COHERE_PATH =
  "M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12zM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0z";

const TRANSFORMERS_PATH =
  "M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm-3 7a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm6 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm-6.5 6a6.5 6.5 0 0 0 7 0 .5.5 0 0 1 .7.7 7.5 7.5 0 0 1-8.4 0 .5.5 0 0 1 .7-.7z";

const OPENAI_COMPATIBLE_PATH =
  "M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 12H6v-2h6v2zm6-4H6v-2h12v2zm0-4H6V6h12v2z";

const CUSTOM_ICONS: Partial<Record<AIProvider, IconDefinition>> = {
  cohere: { hex: "39594D", path: COHERE_PATH, title: "Cohere" },
  groq: { hex: "F55036", path: GROQ_PATH, title: "Groq" },
  openai: { hex: "10A37F", path: OPENAI_PATH, title: "OpenAI" },
  "openai-compatible": {
    hex: "6366F1",
    path: OPENAI_COMPATIBLE_PATH,
    title: "OpenAI Compatible",
  },
  together: { hex: "0F62FE", path: TOGETHER_PATH, title: "Together AI" },
  transformers: {
    hex: "FFD21E",
    path: TRANSFORMERS_PATH,
    title: "Transformers.js",
  },
};

const SIMPLE_ICONS_MAP: Partial<Record<AIProvider, typeof siAnthropic>> = {
  anthropic: siAnthropic,
  deepseek: siDeepseek,
  gemini: siGoogle,
  mistral: siMistralai,
  ollama: siOllama,
  openrouter: siOpenrouter,
};

export function ProviderIcon({
  provider,
  className = "pp:size-4",
}: ProviderIconProps) {
  const simpleIcon = SIMPLE_ICONS_MAP[provider];
  if (simpleIcon) {
    return (
      <svg
        aria-label={simpleIcon.title}
        className={className}
        role="img"
        style={{ fill: `#${simpleIcon.hex}` }}
        viewBox="0 0 24 24"
      >
        <path d={simpleIcon.path} />
      </svg>
    );
  }

  const customIcon = CUSTOM_ICONS[provider];
  if (customIcon) {
    return (
      <svg
        aria-label={customIcon.title}
        className={className}
        role="img"
        style={{ fill: customIcon.hex ? `#${customIcon.hex}` : "currentColor" }}
        viewBox="0 0 24 24"
      >
        <path d={customIcon.path} />
      </svg>
    );
  }

  return (
    <span
      aria-label={provider}
      className={`${className} pp:inline-flex pp:items-center pp:justify-center pp:rounded-full pp:bg-muted pp:font-semibold pp:text-[10px] pp:text-foreground`}
      title={provider}
    >
      {provider.slice(0, 2).toUpperCase()}
    </span>
  );
}
