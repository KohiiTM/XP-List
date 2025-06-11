// Wait for environment variables to be loaded
document.addEventListener("DOMContentLoaded", () => {
  try {
    // Initialize Supabase client
    const supabase = window.supabase.createClient(
      window.env.SUPABASE_URL,
      window.env.SUPABASE_ANON_KEY
    );

    const signupForm = document.getElementById("signup-form");
    const loginForm = document.getElementById("login-form");
    const errorMessage = document.getElementById("error-message");

    if (signupForm) {
      signupForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const confirmPassword =
          document.getElementById("confirm-password").value;

        if (password !== confirmPassword) {
          errorMessage.textContent = "Passwords do not match";
          return;
        }

        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: window.location.origin,
              data: {
                username: document.getElementById("username").value,
                email_confirmed: true,
              },
            },
          });

          if (error) throw error;

          // Store user data
          localStorage.setItem("user", JSON.stringify(data.user));

          // Show success message
          errorMessage.style.color = "#4CAF50";
          errorMessage.textContent = "Account created successfully!";

          // Redirect to main page after 1 second
          setTimeout(() => {
            window.location.href = "index.html";
          }, 1000);
        } catch (error) {
          errorMessage.textContent = error.message;
        }
      });
    }

    if (loginForm) {
      loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw error;

          localStorage.setItem("user", JSON.stringify(data.user));

          window.location.href = "index.html";
        } catch (error) {
          errorMessage.textContent = error.message;
        }
      });
    }
  } catch (error) {
    console.error("Error initializing Supabase client:", error);
  }
});
