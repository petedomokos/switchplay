module.exports = {
    env: {
        browser: true,
        es2021: true,
    },
    extends: [
        "plugin:react/recommended",
        "airbnb",
    ],
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
        ecmaVersion: 12,
        sourceType: "module",
    },
    globals: {},
    plugins: [
        "react",
    ],
    ignorePatterns: ["src/ext/**/*.js", "*.gql.js", "*.generated.js"],
    rules: {
        quotes: ["error", "double"],
        "comma-dangle": ["error", "always-multiline"],
        indent: ["error", 4, { SwitchCase: 1 }],
        "react/jsx-indent": ["error", 4],
        "react/jsx-indent-props": ["error", 4],
        "react/jsx-props-no-spreading": "off",
        "linebreak-style": ["off", "windows"],
        "import/extensions": ["error", "never", { js: "always" }],
        "import/prefer-default-export": "off",
        "padded-blocks": "off",
        "react/jsx-filename-extension": [1, { extensions: [".js", ".jsx"] }],
        "max-len": "off",
        camelcase: ["error", { allow: ["^WC_"] }],
        "no-use-before-define": ["error", { functions: false }],
        "object-curly-newline": "off",
        "operator-linebreak": "off",
        "class-methods-use-this": ["off"],
        "no-param-reassign": "off",
        "react/forbid-prop-types": "off",
        "jsx-a11y/label-has-associated-control": ["error", { required: { some: ["nesting", "id"] } }],
    },
};