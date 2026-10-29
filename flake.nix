{
  description = "kbrdn.dev-v2 - Personal portfolio built with Nuxt 4";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        # bun fmt arrive avec Bun 1.4.4 ; nixos-unstable en est à 1.4.2. Même version
        # que la CI et le Dockerfile. À retirer quand nixpkgs passe en 1.4.4 (NixOS/nixpkgs#577354),
        # avec la ligne flake.nix du step « Bun version pins » de ci.yml.
        bun = pkgs.bun.overrideAttrs (old: {
          version = "1.4.4";
          # src se lit dans passthru.sources, que nixpkgs ne voit pas changer
          __intentionallyOverridingVersion = true;
          passthru = old.passthru // {
            sources = {
              aarch64-darwin = pkgs.fetchurl {
                url = "https://github.com/oven-sh/bun/releases/download/bun-v1.4.4/bun-darwin-aarch64.zip";
                hash = "sha256-wkDX8My5DCY6hJ/NsJt+5iYw2SE0jtaq/ahrnVd7xRA=";
              };
              aarch64-linux = pkgs.fetchurl {
                url = "https://github.com/oven-sh/bun/releases/download/bun-v1.4.4/bun-linux-aarch64.zip";
                hash = "sha256-uqa7NvUdblhWHgK76oJQOKnfRU9nPW13bou/hvjHhQ4=";
              };
              x86_64-linux = pkgs.fetchurl {
                url = "https://github.com/oven-sh/bun/releases/download/bun-v1.4.4/bun-linux-x64-baseline.zip";
                hash = "sha256-4ERutVmVdy65iUvrrppr42jZhai5Jx7hJEhvmUbu3XY=";
              };
            };
          };
        });
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = [
            bun
            pkgs.nodejs_22
            pkgs.git
          ];

          shellHook = ''
            echo "🚀 kbrdn.dev-v2 dev environment"
            echo "Node: $(node --version)"
            echo "Bun: $(bun --version)"
            echo ""
            echo "Commands:"
            echo "  bun install  - Install dependencies"
            echo "  bun run dev  - Start dev server"
            echo "  bun run build - Build for production"
          '';
        };
      }
    );
}
