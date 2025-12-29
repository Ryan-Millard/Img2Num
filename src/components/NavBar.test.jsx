Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => { },
        removeListener: () => { },
        addEventListener: () => { },
        removeEventListener: () => { },
        dispatchEvent: () => false,
    }),
});

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NavBar from './NavBar';

describe('NavBar component', () => {
    const renderNavBar = () =>
        render(
            <MemoryRouter>
                <NavBar />
            </MemoryRouter>
        );

    it('renders the NavBar component', () => {
        renderNavBar();
        expect(screen.getByText('Img2Num')).toBeInTheDocument();
    });

    it('renders internal navigation links', () => {
        renderNavBar();

        expect(screen.getByText('Home')).toBeInTheDocument();
        expect(screen.getByText('Credits')).toBeInTheDocument();
        expect(screen.getByText('About')).toBeInTheDocument();
    });

    it('renders external GitHub link', () => {
        renderNavBar();

        const githubLink = screen.getByText('GitHub');
        expect(githubLink).toBeInTheDocument();
        expect(githubLink.closest('a')).toHaveAttribute(
            'href',
            'https://github.com/Ryan-Millard/Img2Num'
        );
    });

    it('renders the hamburger menu button', () => {
        renderNavBar();

        const button = screen.getByRole('button', { name: /toggle menu/i });
        expect(button).toBeInTheDocument();
    });
});
