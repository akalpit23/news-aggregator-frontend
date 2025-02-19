// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  // add other user fields as needed
}

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // On initial load, check localStorage for an existing JWT
  useEffect(() => {
    const storedToken = localStorage.getItem('jwt_token');
    if (storedToken) {
      setToken(storedToken);
      // Optionally: decode the token to extract user info or call a profile endpoint
      // setUser(decodedUser);
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) {
        throw new Error('Login failed');
      }
      const data = await response.json();
      const jwtToken = data.token; // assume backend returns { token, user }
      localStorage.setItem('jwt_token', jwtToken);
      setToken(jwtToken);
      setUser(data.user);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('jwt_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!token, token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


// for fake one
// // src/context/AuthContext.tsx
// import React, { createContext, useContext, useState, useEffect } from 'react';

// interface User {
//   id: string;
//   username: string;
//   email: string;
// }

// interface AuthContextType {
//   isAuthenticated: boolean;
//   token: string | null;
//   user: User | null;
//   login: (username: string, password: string) => Promise<void>;
//   logout: () => void;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [token, setToken] = useState<string | null>(null);
//   const [user, setUser] = useState<User | null>(null);

//   // On initial load, check localStorage for an existing JWT
//   useEffect(() => {
//     const storedToken = localStorage.getItem('jwt_token');
//     if (storedToken) {
//       setToken(storedToken);
//       console.log("Found stored token:", storedToken);
//       // Optionally, set a hardcoded user here or decode the token
//       setUser({ id: "1", username: "testuser", email: "testuser@example.com" });
//     }
//   }, []);

//   const login = async (username: string, password: string) => {
//     // Hardcoded credentials for testing:
//     const validUsername = "testuser";
//     const validPassword = "testuser";

//     if (username === validUsername && password === validPassword) {
//       // Generate a fake JWT token (this is just a placeholder)
//       const fakeToken = "fake-jwt-token";
//       // Create a fake user object
//       const fakeUser = {
//         id: "1",
//         username: validUsername,
//         email: "testuser@example.com",
//       };
//       localStorage.setItem('jwt_token', fakeToken);
//       setToken(fakeToken);
//       setUser(fakeUser);
//     } else {
//       throw new Error("Invalid credentials");
//     }
//   };

//   const logout = () => {
//     localStorage.removeItem('jwt_token');
//     setToken(null);
//     setUser(null);
//   };

//   return (
//     <AuthContext.Provider value={{ isAuthenticated: !!token, token, user, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };
  