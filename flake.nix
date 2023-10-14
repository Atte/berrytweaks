{
  inputs = {
    nixpkgs.url = "nixpkgs";

    flake-utils.url = "flake-utils";
    flake-compat = {
      url = "github:edolstra/flake-compat";
      flake = false;
    };
  };

  outputs = { self, nixpkgs, flake-utils, ... }: flake-utils.lib.eachDefaultSystem (system:
    let
      pkgs = import nixpkgs {
        inherit system;
      };
      nodejs = pkgs.nodejs-18_x;
    in
    {
      devShells.default = pkgs.mkShell {
        nativeBuildInputs = with pkgs; [
          gnumake
          nodejs
          (yarn.override { inherit nodejs; })
        ];
      };
    });
}
