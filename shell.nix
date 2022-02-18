{ pkgs ? import <nixpkgs> { } }:

pkgs.mkShell {
  buildInputs = with pkgs; [
    gnumake
    nodejs-16_x
    yarn
  ];
}
