import styled from 'styled-components';

export const Page = styled.main`
    min-height: 100vh;
    display: grid;
    background: #f8fafc;

    @media (min-width: 900px) {
        grid-template-columns: minmax(420px, 0.9fr) minmax(520px, 1.1fr);
    }
`;

export const BrandPanel = styled.section`
    position: relative;
    overflow: hidden;
    min-height: 280px;
    padding: 28px 24px 38px;
    color: #f8fafc;
    background: #0f172a;

    &::before,
    &::after {
        content: '';
        position: absolute;
        border-radius: 999px;
        pointer-events: none;
    }

    &::before {
        width: 360px;
        height: 360px;
        top: -235px;
        right: -150px;
        background: #0d9488;
        opacity: 0.45;
    }

    &::after {
        width: 230px;
        height: 230px;
        bottom: -155px;
        left: -110px;
        border: 38px solid #f59e0b;
        opacity: 0.65;
    }

    @media (min-width: 600px) {
        padding: 36px 48px 48px;
    }

    @media (min-width: 900px) {
        min-height: 100vh;
        padding: 48px clamp(48px, 7vw, 104px);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }
`;

export const Brand = styled.div`
    position: relative;
    z-index: 1;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-size: 1rem;
    font-weight: 700;
    letter-spacing: -0.02em;

    img {
        width: 38px;
        height: 38px;
        border-radius: 11px;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
    }
`;

export const BrandContent = styled.div`
    position: relative;
    z-index: 1;
    max-width: 470px;
    margin-top: 58px;

    span {
        display: block;
        margin-bottom: 14px;
        color: #5eead4;
        font-size: 0.75rem;
        font-weight: 800;
        letter-spacing: 0.14em;
        text-transform: uppercase;
    }

    h1 {
        max-width: 11ch;
        font-size: clamp(2rem, 7vw, 3.65rem);
        line-height: 1.05;
        letter-spacing: -0.055em;
    }

    p {
        max-width: 39ch;
        margin-top: 18px;
        color: #cbd5e1;
        font-size: 0.98rem;
        line-height: 1.65;
    }

    @media (min-width: 900px) {
        margin: 0 0 auto;
        padding-top: clamp(100px, 17vh, 170px);
    }
`;

export const TrustNote = styled.p`
    position: relative;
    z-index: 1;
    display: none;
    max-width: 30ch;
    color: #94a3b8;
    font-size: 0.82rem;
    line-height: 1.55;

    @media (min-width: 900px) {
        display: block;
    }
`;

export const AccessPanel = styled.section`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 36px 24px 48px;

    @media (min-width: 600px) {
        padding: 56px 48px;
    }
`;

export const Form = styled.form`
    width: 100%;
    max-width: 408px;
`;

export const FormHeader = styled.header`
    margin-bottom: 30px;

    h2 {
        color: #0f172a;
        font-size: clamp(1.75rem, 4vw, 2.25rem);
        line-height: 1.1;
        letter-spacing: -0.045em;
    }

    p {
        margin-top: 10px;
        color: #64748b;
        font-size: 0.95rem;
        line-height: 1.55;
    }
`;

export const Field = styled.label`
    display: block;
    margin-top: 18px;
    color: #334155;
    font-size: 0.87rem;
    font-weight: 700;

    span {
        display: block;
        margin-bottom: 8px;
    }
`;

export const InputWrap = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 52px;
    padding: 0 15px;
    border: 1px solid #d8e0eb;
    border-radius: 12px;
    background: #fff;
    color: #64748b;
    transition: border-color 160ms ease, box-shadow 160ms ease;

    &:focus-within {
        border-color: #0d9488;
        box-shadow: 0 0 0 4px rgba(13, 148, 136, 0.12);
    }

    input {
        width: 100%;
        min-width: 0;
        padding: 8px 0;
        background: transparent;
        color: #0f172a;
        font-size: 1rem;
    }

    input::placeholder {
        color: #94a3b8;
    }
`;

export const PasswordToggle = styled.button`
    display: grid;
    width: 30px;
    height: 30px;
    flex: 0 0 auto;
    place-items: center;
    border-radius: 7px;
    background: transparent;
    color: #64748b;
    transition: background 160ms ease, color 160ms ease;

    &:hover, &:focus-visible {
        background: #f1f5f9;
        color: #0f172a;
    }
`;

export const ErrorMessage = styled.p`
    margin-top: 16px;
    padding: 10px 12px;
    border-radius: 9px;
    background: #fff1f2;
    color: #be123c;
    font-size: 0.85rem;
    line-height: 1.45;
`;

export const SubmitButton = styled.button`
    width: 100%;
    min-height: 52px;
    margin-top: 28px;
    border-radius: 12px;
    background: #0f766e;
    color: #fff;
    font-size: 0.96rem;
    font-weight: 800;
    transition: background 160ms ease, transform 160ms ease, box-shadow 160ms ease;

    &:hover:not(:disabled) {
        background: #115e59;
        box-shadow: 0 8px 18px rgba(15, 118, 110, 0.2);
        transform: translateY(-1px);
    }

    &:active:not(:disabled) { transform: translateY(0); }

    &:focus-visible { box-shadow: 0 0 0 4px rgba(13, 148, 136, 0.2); }

    &:disabled { cursor: wait; opacity: 0.68; }
`;

export const HelpText = styled.p`
    margin-top: 18px;
    color: #94a3b8;
    font-size: 0.79rem;
    line-height: 1.55;
    text-align: center;
`;
