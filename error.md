# PromptPen Error & Troubleshooting Log (`error.md`)

This file records technical errors encountered during development, their underlying root causes, and the verified solutions applied in the codebase for future developer reference.

---

## Error Log 1: TransformersJS `Unexpected argument[0]: must be 'path' or 'buffer'`

### Symptom
```text
In-browser model error: TransformersJS generation failed: Failed to initialize TransformersJS model: Unexpected argument[0]: must be 'path' or 'buffer'.
```

### Root Causes
1. **Webpage Content Security Policy (CSP) & CORS in Content Script Context**:
   - Content scripts execute in the target web page's DOM context (`github.com`, `google.com`, `example.com`, etc.).
   - When `@huggingface/transformers` calls `window.fetch("https://huggingface.co/...")` directly inside the content script window context, third-party webpage Content Security Policies (`connect-src`) or CORS redirect restrictions block the network request.
   - When `fetch` fails, `@huggingface/transformers` helper `loadResourceFile` receives a non-200 / error response and returns `null`.
   - `@huggingface/transformers` passes `buffer_or_path = null` to ONNX Runtime's `InferenceSession.create(null)`, which throws `Unexpected argument[0]: must be 'path' or 'buffer'`.

2. **LFS CDN Header Injection**:
   - When fetching ONNX model weights (e.g., `model_q4.onnx`), Hugging Face issues an HTTP 302 redirect from `huggingface.co` to the presigned LFS S3 CDN (`cdn-lfs.huggingface.co`).
   - Attaching an `Authorization: Bearer <token>` header to `cdn-lfs.huggingface.co` presigned S3 URLs causes AWS S3/Cloudfront to reject presigned requests with `400 Bad Request` / `403 Forbidden`.

### Solutions Applied
- **Extension Background Proxy Fetching**:
  - Implemented background proxy fetching (`FETCH_REMOTE_ASSET`) in `entrypoints/background.ts`. When `env.fetch` runs in a content script, it delegates model file downloads to the extension background service worker (`background.ts`), which has full manifest `host_permissions: ["<all_urls>"]` and is completely unaffected by target webpage CSP or CORS restrictions.
- **LFS CDN Header Stripping**:
  - Excluded LFS CDN domains (`cdn-lfs.huggingface.co` and `cdn-lfs.hf.co`) from receiving `Authorization` headers in `features/providers/transformers/index.ts` and `entrypoints/options/sections/self-hosted.tsx`.
- **4-Bit Quantized Models (`dtype: "q4"`)**:
  - Target self-contained 4-bit ONNX single-file binaries (`dtype: "q4"`) for in-browser models.

---

## Error Log 2: Firefox Extension WASM Cache `TypeError: Cache.put`

### Symptom
```text
Failed to cache ort-wasm-simd-threaded.asyncify.wasm: TypeError: Cache.put: Request URL moz-extension://.../onnx/ort-wasm-simd-threaded.asyncify.wasm must be either http:// or https://.
```

### Root Cause
Setting `env.useWasmCache = true` caused `@huggingface/transformers` to attempt saving WebAssembly engine binaries into the browser's Cache API (`window.caches.put()`). The W3C Cache API standard strictly mandates `http://` or `https://` URLs. Browser extension scheme URLs (`moz-extension://` or `chrome-extension://`) cause `Cache.put` to throw a fatal `TypeError`.

### Solution
Set `env.useWasmCache = false` in `features/providers/transformers/index.ts` and `entrypoints/options/sections/self-hosted.tsx`. Local extension WASM assets are already stored on disk inside the extension bundle (`browser.runtime.getURL("/onnx/...")`), so Cache API storage is unnecessary.

---

## Error Log 3: AI SDK Model `specificationVersion` Compatibility Warning / Error

### Symptom
```text
AI SDK 5 only supports models that implement specification version "v2".
```

### Root Cause
Vercel AI SDK (version 5+ / `ai` package) validates model object interfaces against `specificationVersion: "v2"`. Overriding or returning `"v1"` causes `generateText` validation to fail or emit compatibility mode warnings.

### Solution
Returned `"v2"` for `specificationVersion` in the `LanguageModel` proxy inside `features/providers/transformers/index.ts`.
