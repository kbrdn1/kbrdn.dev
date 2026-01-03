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
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            bun
            nodejs_22
            git
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
