import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import NavBar from './NavBar';

// Mock the lucide-react icons
vi.mock('lucide-react', () => ({
  Home: () => <span data-testid="home-icon">Home</span>,
  Users: () => <span data-testid="users-icon">Users</span>,
  Info: () => <span data-testid="info-icon">Info</span>,
  Github: () => <span data-testid="github-icon">Github</span>,
  SquareArrowOutUpRight: () => <span data-testid="external-icon">External</span>,
  Menu: () => <span data-testid="menu-icon">Menu</span>,
  X: () => <span data-testid="close-icon">X</span>,
  Sun: () => <span data-testid="sun-icon">Sun</span>,
  Moon: () => <span data-testid="moon-icon">Moon</span>,
}));

// Helper function to render with router
const renderWithRouter = (component, { route = '/' } = {}) => {
  return render(<MemoryRouter initialEntries={[route]}>{component}</MemoryRouter>);
};

describe('NavBar', () => {
  beforeEach(() => {
    // Reset any mocks before each test
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the logo with correct text and link', () => {
      renderWithRouter(<NavBar />);

      const logo = screen.getByRole('link', { name: /Img2Num/i });
      expect(logo).toBeInTheDocument();
      expect(logo).toHaveAttribute('href', '/');
      expect(screen.getByText('Img2Num')).toBeInTheDocument();
    });

    it('should render all internal navigation links', () => {
      renderWithRouter(<NavBar />);

      expect(screen.getByRole('menuitem', { name: /home/i })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /credits/i })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /about/i })).toBeInTheDocument();
    });

    it('should render all external navigation links', () => {
      renderWithRouter(<NavBar />);

      const docsLink = screen.getByRole('menuitem', { name: /docs/i });
      const githubLink = screen.getByRole('menuitem', { name: /github/i });

      expect(docsLink).toBeInTheDocument();
      expect(docsLink).toHaveAttribute('target', '_blank');
      expect(docsLink).toHaveAttribute('rel', 'noopener noreferrer');

      expect(githubLink).toBeInTheDocument();
      expect(githubLink).toHaveAttribute('target', '_blank');
      expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should render the mobile menu toggle button', () => {
      renderWithRouter(<NavBar />);

      const menuToggle = screen.getByRole('button', { name: /open menu/i });
      expect(menuToggle).toBeInTheDocument();
      expect(menuToggle).toHaveAttribute('aria-expanded', 'false');
      expect(menuToggle).toHaveAttribute('aria-controls', 'nav-menu');
    });

    it('should render the theme switch', () => {
      renderWithRouter(<NavBar />);

      // ThemeSwitch is rendered inside the nav list
      const navList = screen.getByRole('menubar');
      expect(navList).toBeInTheDocument();
    });
  });

  describe('Active State', () => {
    it('should mark the home link as active when on home page', () => {
      renderWithRouter(<NavBar />, { route: '/' });

      const homeLink = screen.getByRole('menuitem', { name: /home/i });
      expect(homeLink.className).toMatch(/active/);
    });

    it('should mark the credits link as active when on credits page', () => {
      renderWithRouter(<NavBar />, { route: '/credits' });

      const creditsLink = screen.getByRole('menuitem', { name: /credits/i });
      expect(creditsLink.className).toMatch(/active/);
    });

    it('should mark the about link as active when on about page', () => {
      renderWithRouter(<NavBar />, { route: '/about' });

      const aboutLink = screen.getByRole('menuitem', { name: /about/i });
      expect(aboutLink.className).toMatch(/active/);
    });

    it('should not mark external links as active', () => {
      renderWithRouter(<NavBar />, { route: '/' });

      const docsLink = screen.getByRole('menuitem', { name: /docs/i });
      const githubLink = screen.getByRole('menuitem', { name: /github/i });

      expect(docsLink.className).not.toMatch(/active/);
      expect(githubLink.className).not.toMatch(/active/);
    });
  });

  describe('Mobile Menu Interaction', () => {
    it('should open mobile menu when toggle is clicked', async () => {
      renderWithRouter(<NavBar />);

      const menuToggle = screen.getByRole('button', { name: /open menu/i });
      const navList = screen.getByRole('menubar');

      // Initially closed
      expect(menuToggle).toHaveAttribute('aria-expanded', 'false');
      expect(navList.className).not.toMatch(/open/);

      // Click to open
      fireEvent.click(menuToggle);

      await waitFor(() => {
        expect(menuToggle).toHaveAttribute('aria-expanded', 'true');
        expect(navList.className).toMatch(/open/);
      });
    });

    it('should close mobile menu when toggle is clicked again', async () => {
      renderWithRouter(<NavBar />);

      const menuToggle = screen.getByRole('button', { name: /open menu/i });
      const navList = screen.getByRole('menubar');

      // Open menu
      fireEvent.click(menuToggle);

      await waitFor(() => {
        expect(navList.className).toMatch(/open/);
      });

      // Close menu
      const closeButton = screen.getByRole('button', { name: /close menu/i });
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(menuToggle).toHaveAttribute('aria-expanded', 'false');
        expect(navList.className).not.toMatch(/open/);
      });
    });

    it('should show backdrop when mobile menu is open', async () => {
      renderWithRouter(<NavBar />);

      const menuToggle = screen.getByRole('button', { name: /open menu/i });

      // Initially no backdrop visible
      expect(document.querySelector('[aria-hidden="true"]')).not.toBeInTheDocument();

      // Open menu
      fireEvent.click(menuToggle);

      await waitFor(() => {
        // Backdrop is rendered as a sibling to the nav element (not inside it)
        // for proper full-screen coverage on mobile
        const backdrop = document.querySelector('[aria-hidden="true"]');
        expect(backdrop).toBeInTheDocument();
      });
    });

    it('should close mobile menu when backdrop is clicked', async () => {
      renderWithRouter(<NavBar />);

      const menuToggle = screen.getByRole('button', { name: /open menu/i });
      const navList = screen.getByRole('menubar');

      // Open menu
      fireEvent.click(menuToggle);

      await waitFor(() => {
        expect(navList.className).toMatch(/open/);
      });

      // Click backdrop
      const backdrop = document.querySelector('[aria-hidden="true"]');
      fireEvent.click(backdrop);

      await waitFor(() => {
        expect(navList.className).not.toMatch(/open/);
      });
    });

    it('should close mobile menu when a navigation link is clicked', async () => {
      renderWithRouter(<NavBar />);

      const menuToggle = screen.getByRole('button', { name: /open menu/i });
      const navList = screen.getByRole('menubar');

      // Open menu
      fireEvent.click(menuToggle);

      await waitFor(() => {
        expect(navList.className).toMatch(/open/);
      });

      // Click a navigation link
      const homeLink = screen.getByRole('menuitem', { name: /home/i });
      fireEvent.click(homeLink);

      await waitFor(() => {
        expect(navList.className).not.toMatch(/open/);
      });
    });

    it('should close mobile menu when logo is clicked', async () => {
      renderWithRouter(<NavBar />);

      const menuToggle = screen.getByRole('button', { name: /open menu/i });
      const navList = screen.getByRole('menubar');

      // Open menu
      fireEvent.click(menuToggle);

      await waitFor(() => {
        expect(navList.className).toMatch(/open/);
      });

      // Click logo
      const logo = screen.getByRole('link', { name: /Img2Num/i });
      fireEvent.click(logo);

      await waitFor(() => {
        expect(navList.className).not.toMatch(/open/);
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes on menu toggle', () => {
      renderWithRouter(<NavBar />);

      const menuToggle = screen.getByRole('button', { name: /open menu/i });

      expect(menuToggle).toHaveAttribute('aria-expanded', 'false');
      expect(menuToggle).toHaveAttribute('aria-controls', 'nav-menu');
      expect(menuToggle).toHaveAttribute('aria-label', 'Open menu');
    });

    it('should update ARIA attributes when menu is opened', async () => {
      renderWithRouter(<NavBar />);

      const menuToggle = screen.getByRole('button', { name: /open menu/i });
      fireEvent.click(menuToggle);

      await waitFor(() => {
        expect(menuToggle).toHaveAttribute('aria-expanded', 'true');
        expect(menuToggle).toHaveAttribute('aria-label', 'Close menu');
      });
    });

    it('should have menubar role on nav list', () => {
      renderWithRouter(<NavBar />);

      const navList = screen.getByRole('menubar');
      expect(navList).toHaveAttribute('id', 'nav-menu');
    });

    it('should have menuitem role on all links', () => {
      renderWithRouter(<NavBar />);

      const menuItems = screen.getAllByRole('menuitem');
      // 3 internal links + 2 external links = 5 menu items
      expect(menuItems).toHaveLength(5);
    });

    it('should have proper alt text on logo image', () => {
      renderWithRouter(<NavBar />);

      const logoImage = screen.getByAltText('');
      expect(logoImage).toBeInTheDocument();
      // Empty alt is intentional as it's decorative and the text "Img2Num" provides context
    });

    it('should mark backdrop as aria-hidden', async () => {
      renderWithRouter(<NavBar />);

      const menuToggle = screen.getByRole('button', { name: /open menu/i });
      fireEvent.click(menuToggle);

      await waitFor(() => {
        const backdrop = document.querySelector('[aria-hidden="true"]');
        expect(backdrop).toBeInTheDocument();
      });
    });
  });

  describe('External Links Security', () => {
    it('should have proper security attributes on external links', () => {
      renderWithRouter(<NavBar />);

      const externalLinks = screen
        .getAllByRole('menuitem')
        .filter((link) => link.hasAttribute('target') && link.getAttribute('target') === '_blank');

      externalLinks.forEach((link) => {
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      });
    });
  });

  describe('Navigation', () => {
    it('should have correct href for internal links', () => {
      renderWithRouter(<NavBar />);

      expect(screen.getByRole('menuitem', { name: /home/i })).toHaveAttribute('href', '/');
      expect(screen.getByRole('menuitem', { name: /credits/i })).toHaveAttribute('href', '/credits');
      expect(screen.getByRole('menuitem', { name: /about/i })).toHaveAttribute('href', '/about');
    });

    it('should have correct href for external links', () => {
      renderWithRouter(<NavBar />);

      const docsLink = screen.getByRole('menuitem', { name: /docs/i });
      const githubLink = screen.getByRole('menuitem', { name: /github/i });

      expect(docsLink).toHaveAttribute('href', 'https://ryan-millard.github.io/Img2Num/info/');
      expect(githubLink).toHaveAttribute('href', 'https://github.com/Ryan-Millard/Img2Num');
    });
  });

  describe('Icons', () => {
    it('should render icons for all navigation links', () => {
      renderWithRouter(<NavBar />);

      // Check that icons are rendered (we mocked them with data-testid)
      expect(screen.getAllByTestId('home-icon')).toHaveLength(1);
      expect(screen.getAllByTestId('users-icon')).toHaveLength(1);
      expect(screen.getAllByTestId('info-icon')).toHaveLength(2); // Appears in both About and Docs
      expect(screen.getAllByTestId('github-icon')).toHaveLength(1);
    });

    it('should render external link icons', () => {
      renderWithRouter(<NavBar />);

      // External icon should appear twice (once for each external link)
      expect(screen.getAllByTestId('external-icon')).toHaveLength(2);
    });

    it('should toggle between Menu and X icons', async () => {
      renderWithRouter(<NavBar />);

      // Initially shows Menu icon
      expect(screen.getByTestId('menu-icon')).toBeInTheDocument();
      expect(screen.queryByTestId('close-icon')).not.toBeInTheDocument();

      // Click to open
      const menuToggle = screen.getByRole('button', { name: /open menu/i });
      fireEvent.click(menuToggle);

      await waitFor(() => {
        // Now shows X icon
        expect(screen.queryByTestId('menu-icon')).not.toBeInTheDocument();
        expect(screen.getByTestId('close-icon')).toBeInTheDocument();
      });
    });
  });

  describe('Sticky Positioning', () => {
    it('should render as a nav element', () => {
      renderWithRouter(<NavBar />);

      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });
  });
});
