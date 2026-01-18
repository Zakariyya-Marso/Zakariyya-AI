import React, { useState } from 'react';

// Removed interface AuthScreenProps

const AuthScreen = ({ onLogin, onSignup }) => { // Removed React.FC<AuthScreenProps>
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => { // Removed React.FormEvent type annotation
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!username || !password) {
      setError('Please enter both username and password.');
      setLoading(false);
      return;
    }

    let errorMessage = null;
    if (isLoginMode) {
      errorMessage = onLogin(username, password);
    } else {
      errorMessage = onSignup(username, password);
    }

    if (errorMessage) {
      setError(errorMessage);
    }
    setLoading(false);
  };

  return (
    React.createElement("div", { className: "flex flex-col items-center justify-center min-h-screen bg-zinc-950 p-4 text-gray-100" },
      React.createElement("div", { className: "bg-zinc-900 p-8 rounded-lg shadow-lg w-full max-w-md border border-red-900" },
        React.createElement("h2", { className: "text-3xl font-bold text-center text-red-500 mb-6" },
          isLoginMode ? 'Welcome Back!' : 'Join Gemini Chat!'
        ),
        React.createElement("form", { onSubmit: handleSubmit, className: "space-y-4" },
          React.createElement("div", null,
            React.createElement("label", { htmlFor: "username", className: "block text-sm font-medium text-gray-300 mb-1" }, "Username"),
            React.createElement("input", {
              type: "text",
              id: "username",
              value: username,
              onChange: (e) => setUsername(e.target.value),
              className: "w-full px-4 py-2 border border-zinc-700 rounded-lg focus:ring-red-500 focus:border-red-500 bg-zinc-800 text-gray-100 placeholder-gray-400",
              placeholder: "Your username",
              autoComplete: "username",
              disabled: loading
            })
          ),
          React.createElement("div", null,
            React.createElement("label", { htmlFor: "password", className: "block text-sm font-medium text-gray-300 mb-1" }, "Password"),
            React.createElement("input", {
              type: "password",
              id: "password",
              value: password,
              onChange: (e) => setPassword(e.target.value),
              className: "w-full px-4 py-2 border border-zinc-700 rounded-lg focus:ring-red-500 focus:border-red-500 bg-zinc-800 text-gray-100 placeholder-gray-400",
              placeholder: "Your password",
              autoComplete: isLoginMode ? "current-password" : "new-password",
              disabled: loading
            })
          ),

          error && React.createElement("p", { className: "text-red-500 text-sm text-center" }, error),

          React.createElement("button", {
            type: "submit",
            className: "w-full bg-red-800 text-white py-2 px-4 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-zinc-900 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
            disabled: loading
          }, loading ? (isLoginMode ? 'Logging in...' : 'Signing up...') : (isLoginMode ? 'Login' : 'Sign Up'))
        ),

        React.createElement("p", { className: "mt-6 text-center text-sm text-gray-400" },
          isLoginMode ? "Don't have an account?" : "Already have an account?", ' ',
          React.createElement("button", {
            onClick: () => {
              setIsLoginMode(!isLoginMode);
              setError(null); // Clear errors when switching mode
              setUsername(''); // Clear inputs
              setPassword('');
            },
            className: "text-red-500 hover:text-red-400 font-medium focus:outline-none",
            disabled: loading
          }, isLoginMode ? 'Sign Up' : 'Login')
        )
      )
    )
  );
};

export default AuthScreen;