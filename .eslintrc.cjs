// Sample Eslint config for React project
module.exports = {
  env: { browser: true, es2020: true, node: true },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:react-hooks/recommended",
  ],
  parserOptions: { ecmaVersion: "latest", sourceType: "module" },
  settings: { react: { version: "18.2" } },
  plugins: ["react", "react-hooks", "react-refresh"],
  rules: {
    //React
    "react-refresh/only-export-components": "warn",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "react/prop-types": 0,
    "react/display-name": 0,

    //MUI
    "no-restricted-imports": [
      "error",
      {
        patterns: ["@mui/*/*/*"],
      },
    ],

    //Common
    "no-console": 1, // Cảnh báo nếu dùng console.log, console.error,... (1 = "warn")
    "no-lonely-if": 1, // Cảnh báo if đơn lẻ trong một block không cần thiết (ví dụ: if trong else)
    "no-unused-vars": 1, // Cảnh báo biến khai báo nhưng không dùng
    "no-trailing-spaces": 1, // Cảnh báo nếu có dấu cách dư ở cuối dòng
    "no-multi-spaces": 1, // Cảnh báo nếu có nhiều dấu cách liên tiếp không cần thiết
    "no-multiple-empty-lines": 1, // Cảnh báo nếu có nhiều dòng trống liên tục
    "space-before-blocks": ["error", "always"], // Bắt buộc có dấu cách trước dấu `{`
    "object-curly-spacing": [1, "always"], // Dấu cách giữa dấu `{}` trong object: { key: value }
    // indent: ["warn", 2], // Thụt dòng bằng 2 dấu cách
    // semi: [1, "never"], // Cảnh báo nếu dùng dấu `;` (vì muốn không dùng semicolon)
    // quotes: ["error", "single"], // Bắt buộc dùng dấu nháy đơn `'` thay vì nháy đôi `"`
    "array-bracket-spacing": 1, // Dấu cách trong `[]`, ví dụ: `[ 1, 2 ]` thay vì `[1, 2]`
    "linebreak-style": 0, // Bỏ qua lỗi do khác nhau giữa Windows (\r\n) và Unix (\n)
    "no-unexpected-multiline": "warn", // Cảnh báo lỗi cú pháp gây ra bởi xuống dòng sai cách
    // "keyword-spacing": 1, // Cảnh báo nếu thiếu khoảng trắng sau từ khóa (`if`, `for`, `return`,...)
    // "comma-dangle": 1, // Cảnh báo nếu có hoặc thiếu dấu phẩy cuối cùng trong danh sách (array, object, param)
    "comma-spacing": 1, // Khoảng trắng sau dấu phẩy: `a, b` chứ không phải `a,b`
    "arrow-spacing": 1, // Khoảng trắng xung quanh `=>`: `(a) => b` chứ không phải `(a)=>b`
  },
};
