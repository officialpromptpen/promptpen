export default {
  ignore: {
    files: [".output/**", ".wxt/**", "public/onnx/**"],
    rules: [
      "react-doctor/require-pnpm-hardening",
      "deslop/unused-dev-dependency",
    ],
  },
};
