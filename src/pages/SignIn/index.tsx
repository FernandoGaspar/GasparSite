import React, { FormEvent, useState } from 'react';
import axios from 'axios';
import { FiEye, FiEyeOff, FiLock, FiMail } from 'react-icons/fi';
import logoImg from '../../assets/gaspar-mark.png';
import { useAuth } from '../../hooks/auth';
import {
    AccessPanel,
    Brand,
    BrandContent,
    BrandPanel,
    ErrorMessage,
    Field,
    Form,
    FormHeader,
    HelpText,
    InputWrap,
    Page,
    PasswordToggle,
    SubmitButton,
    TrustNote,
} from './styles';

const SignIn: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const { signIn } = useAuth();

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isSubmitting) return;
        setError('');
        setIsSubmitting(true);

        try {
            const authenticated = await signIn(email.trim(), password);
            if (!authenticated) setError('Não foi possível validar suas credenciais.');
        } catch (failure) {
            if (axios.isAxiosError(failure) && failure.response?.status === 429) {
                setError('Muitas tentativas de acesso. Aguarde alguns minutos antes de tentar novamente.');
            } else if (axios.isAxiosError(failure) && failure.response?.status === 401) {
                setError('Não foi possível validar seu acesso. Confira o e-mail e a senha.');
            } else if (axios.isAxiosError(failure) && failure.response?.status === 503) {
                setError('O serviço de login está indisponível. A API não conseguiu acessar o banco de dados; a conexão do servidor precisa ser corrigida.');
            } else {
                setError('Não foi possível conectar ao servidor. Tente novamente em instantes.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Page>
            <BrandPanel>
                <Brand>
                    <img src={logoImg} alt="" aria-hidden="true" />
                    <span>Gaspar</span>
                </Brand>

                <BrandContent>
                    <span>Organização financeira</span>
                    <h1>Clareza para cada decisão.</h1>
                    <p>Centralize sua vida financeira e acompanhe o que importa em um só lugar.</p>
                </BrandContent>

                <TrustNote>Seu acesso é individual e protegido. Use suas credenciais para continuar.</TrustNote>
            </BrandPanel>

            <AccessPanel>
                <Form onSubmit={handleSubmit}>
                    <FormHeader>
                        <h2>Boas-vindas de volta</h2>
                        <p>Entre para consultar sua carteira e movimentações.</p>
                    </FormHeader>

                    <Field>
                        <span>E-mail</span>
                        <InputWrap>
                            <FiMail aria-hidden="true" size={19} />
                            <input
                                type="email"
                                autoComplete="email"
                                placeholder="voce@exemplo.com"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                required
                            />
                        </InputWrap>
                    </Field>

                    <Field>
                        <span>Senha</span>
                        <InputWrap>
                            <FiLock aria-hidden="true" size={19} />
                            <input
                                type={isPasswordVisible ? 'text' : 'password'}
                                autoComplete="current-password"
                                placeholder="Digite sua senha"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                required
                            />
                            <PasswordToggle
                                type="button"
                                aria-label={isPasswordVisible ? 'Ocultar senha' : 'Mostrar senha'}
                                onClick={() => setIsPasswordVisible((visible) => !visible)}
                            >
                                {isPasswordVisible ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                            </PasswordToggle>
                        </InputWrap>
                    </Field>

                    {error && <ErrorMessage role="alert">{error}</ErrorMessage>}

                    <SubmitButton type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Validando acesso…' : 'Entrar no Gaspar'}
                    </SubmitButton>
                    <HelpText>Problemas para acessar? Entre em contato com o administrador.</HelpText>
                </Form>
            </AccessPanel>
        </Page>
    );
};

export default SignIn;
