{
  description = "Grounded static airline disruption scenario site";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

  outputs = { self, nixpkgs }:
    let
      systems = [ "x86_64-linux" "aarch64-linux" "x86_64-darwin" "aarch64-darwin" ];
      forAllSystems = f: nixpkgs.lib.genAttrs systems (system: f nixpkgs.legacyPackages.${system});
    in {
      devShells = forAllSystems (pkgs: {
        default = pkgs.mkShell {
          packages = with pkgs; [ python3 git gh ];
          shellHook = ''echo "Run: python3 -m http.server 8000 (then visit http://localhost:8000)"'';
        };
      });
      packages = forAllSystems (pkgs: {
        default = pkgs.runCommand "grounded-static-site" {} ''
          mkdir -p $out
          cp ${./index.html} ${./styles.css} ${./app.js} $out/
          touch $out/.nojekyll
        '';
      });
    };
}
