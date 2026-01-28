{ pkgs, ... }: {
  packages = [ pkgs.nodejs_20 ];
  idx = {
    extensions = [ "dbaeumer.vscode-eslint" ];
    workspace = {
      onCreate = {
        npm-install = "npm install";
      };
      onStart = {
        dev-server = "npm start";
      };
    };
    previews = {
      enable = true;
      previews = {
        web = {
          command = ["npm" "start" "--" "--port" "$PORT"];
          manager = "web";
        };
      };
    };
  };
}