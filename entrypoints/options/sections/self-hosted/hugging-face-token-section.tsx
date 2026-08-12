import { Check, Save } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveProviderConfig } from "@/features/providers/storage";

const TRANSFORMERS_FALLBACK_MODEL =
  "onnx-community/SmolLM2-135M-Instruct-ONNX-MHA";

interface HuggingFaceTokenSectionProps {
  initialToken: string;
  onSaved?: () => void;
}

export function HuggingFaceTokenSection({
  initialToken,
  onSaved,
}: HuggingFaceTokenSectionProps) {
  const [hfToken, setHfToken] = useState(initialToken);
  const [hfTokenSaved, setHfTokenSaved] = useState(initialToken.length > 0);

  async function handleSaveHfToken() {
    await saveProviderConfig(
      "transformers",
      TRANSFORMERS_FALLBACK_MODEL,
      undefined,
      undefined,
      hfToken || undefined
    );
    setHfTokenSaved(true);
    if (onSaved) {
      await onSaved();
    }
  }

  async function handleClearHfToken() {
    await saveProviderConfig(
      "transformers",
      TRANSFORMERS_FALLBACK_MODEL,
      undefined,
      undefined,
      ""
    );
    setHfToken("");
    setHfTokenSaved(false);
    if (onSaved) {
      await onSaved();
    }
  }

  return (
    <div className="pp:mb-4 pp:space-y-1.5">
      <Label htmlFor="transformers-hf-token">Hugging Face access token</Label>
      <div className="pp:flex pp:items-center pp:gap-2">
        <Input
          id="transformers-hf-token"
          onChange={(e) => {
            setHfToken(e.target.value);
            setHfTokenSaved(false);
          }}
          placeholder="Required for gated models"
          type="password"
          value={hfToken}
        />
        <Button className="pp:shrink-0 pp:gap-2" onClick={handleSaveHfToken}>
          {hfTokenSaved ? (
            <Check className="pp:size-4" />
          ) : (
            <Save className="pp:size-4" />
          )}
          {hfTokenSaved ? "Saved" : "Save Token"}
        </Button>
        {hfTokenSaved && (
          <Button
            className="pp:shrink-0"
            onClick={handleClearHfToken}
            size="sm"
            variant="ghost"
          >
            Clear
          </Button>
        )}
      </div>
      <p className="pp:pt-1 pp:font-normal pp:text-muted-foreground pp:text-xs pp:leading-relaxed">
        💡 <strong>Note:</strong> Public ONNX models (such as recommended
        Qwen2.5 and SmolLM2 models) <strong>do not require a token</strong> to
        download and run. A Hugging Face access token is only required if you
        are downloading <strong>gated, private, or restricted models</strong>{" "}
        from Hugging Face.
      </p>
    </div>
  );
}
