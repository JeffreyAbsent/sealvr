Hi Jeffrey,

This is the standalone VR Viewer for the Topgolf project.

I developed it using Next.js (version 12.3.4) with all dependencies installed on Node.js (version 18.17.1).

Key Files:

1. public/project: This folder contains all the images related to the project.
2. src/project.json: This file includes all data related to the VR project.
   These files are generated using macros, so for future projects, feel free to ask me to generate them.

To Run the Project Locally:

1. Run npm install to install dependencies.
2. Start the development server with npm run dev.
3. Access the application at http://localhost:3000.

Deployment:

1. install nvm
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
    # 或者使用wget
   wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
3. nvm install 18.18.0
4. npm install
5. npm run build
6. nohup npm start

Let me know if you need further adjustments!
