import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// O build vai direto para os recursos estáticos do Spring Boot, então
// `./mvnw spring-boot:run` serve a interface em http://localhost:8080.
// Em `npm run dev` (porta 5173), as chamadas /api vão para o Spring.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "../src/main/resources/static",
    emptyOutDir: true
  },
  server: {
    proxy: {
      "/api": "http://localhost:8080"
    }
  }
});
