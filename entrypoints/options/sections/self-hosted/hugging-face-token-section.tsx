import { Save } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
	getDecryptedAccessToken,
	saveProviderConfig,
} from "@/features/providers/storage"

interface HuggingFaceTokenSectionProps {
	initialToken: string
}

export function HuggingFaceTokenSection({
	initialToken,
}: HuggingFaceTokenSectionProps) {
	const [hfToken, setHfToken] = useState(initialToken)
	const [hfTokenSaved, setHfTokenSaved] = useState(initialToken.length > 0)

	async function handleSaveHfToken() {
		await saveProviderConfig(
			"transformers",
			"onnx-community/Qwen2-0.5B-Instruct-ONNX",
			undefined,
			undefined,
			hfToken || undefined,
		)
		setHfTokenSaved(true)
	}

	async function handleClearHfToken() {
		await saveProviderConfig(
			"transformers",
			"onnx-community/Qwen2-0.5B-Instruct-ONNX",
			undefined,
			undefined,
			"",
		)
		setHfToken("")
		setHfTokenSaved(false)
	}

	return (
		<div className="pp:mb-4 pp:space-y-1.5">
			<label
				className="pp:font-medium pp:text-sm"
				htmlFor="transformers-hf-token"
			>
				Hugging Face access token
			</label>
			<div className="pp:flex pp:items-center pp:gap-2">
				<input
					className="pp:h-9 pp:flex-1 pp:rounded-md pp:border pp:bg-background pp:px-3 pp:text-sm"
					id="transformers-hf-token"
					onChange={(e) => {
						setHfToken(e.target.value)
						setHfTokenSaved(false)
					}}
					placeholder="Required for gated models"
					type="password"
					value={hfToken}
				/>
				<Button
					className="pp:shrink-0"
					onClick={handleSaveHfToken}
					variant="outline"
				>
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
		</div>
	)
}
