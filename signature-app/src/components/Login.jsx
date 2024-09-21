import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';

const Container = styled.div`
  width: 400px; /* Aumente a largura conforme necessário */
  margin: auto;
  padding: 20px;
  background-color: ${({ theme }) => theme.body};
  color: ${({ theme }) => theme.text};
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  text-align: center; /* Centraliza o conteúdo */
`;

const Input = styled.input`
  width: 100%;
  margin: 10px 0;
  padding: 8px;
`;

const Button = styled.button`
  width: 100%;
  padding: 10px;
  background-color: ${({ theme }) => theme.buttonBg};
  color: ${({ theme }) => theme.buttonText};
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

const Logo = styled.img`
  width: 100px; /* Ajuste o tamanho do logo */
  margin-bottom: 20px; /* Espaço entre o logo e o título */
`;

const Login = () => {
  const [re, setRe] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(`http://localhost:5000/users?re=${re}&password=${password}`);
      if (response.data.length > 0) {
        localStorage.setItem('user', JSON.stringify(response.data[0]));
        navigate('/dashboard');
      } else {
        alert('Login failed');
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const newUser = { re, password };
      await axios.post('http://localhost:5000/users', newUser);
      alert('User registered successfully');
      setIsSignUp(false);
    } catch (error) {
      console.error('Sign Up failed:', error);
    }
  };

  return (
    <Container>
      <Logo src="/datawakelogo.png" alt="Logo da Empresa" />
      <h2>{isSignUp ? 'Criar Conta' : 'Faça Login para acessar a Assinatura Digital'}</h2>
      <form onSubmit={isSignUp ? handleSignUp : handleLogin}>
        <Input type="text" value={re} onChange={(e) => setRe(e.target.value)} placeholder="Usuário" required />
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" required />
        <Button type="submit">{isSignUp ? 'Criar Conta' : 'Login'}</Button>
      </form>
      <br />
      <Button onClick={() => setIsSignUp(!isSignUp)}>
        {isSignUp ? 'Já possui uma conta? Login' : 'Crie uma conta'}
      </Button>
    </Container>
  );
};

export default Login;
