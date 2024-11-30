// src/i18n/en.ts
export default {
    app: {
        title: "Offering Bowl"
    },
    nav: {
        about: "About",
        howItWorks: "How It Works",
        tax: "Tax Benefits",
        signin: "Log in",
        signup: "Get started",
        home: "Home",
        explore: "Explore",
        chat: "Chat",
        settings: "Settings",
        logout: "Sign Out",
        chooseSignupType: "Join Offering Bowl",
        signupAsPatron: "Join as a Patron",
        signupAsMonastic: "Join as a Monastic",
        comingBeta: "Coming in the beta version"
    },
    home: {
        title: "Support Monastics Worldwide",
        subtitle: "Connect with and support monastics through direct donations and sponsorship",
        becomePatron: "Become a Patron",
        registerMonastic: "Register as Monastic",
        features: {
            support: {
                title: "Direct Support",
                description:
                    "Provide direct support to monastics and religious communities worldwide"
            },
            connect: {
                title: "Meaningful Connections",
                description: "Build lasting relationships with monastics and fellow patrons"
            },
            trust: {
                title: "Verified Communities",
                description: "All monastic profiles are carefully verified for authenticity"
            }
        }
    },
    auth: {
        form: {
            name: "Full Name",
            email: "Email Address",
            password: "Password",
            confirmPassword: "Confirm Password"
        },
        signup: {
            patron: {
                title: "Become a Patron"
            },
            monastic: {
                title: "Register as Monastic"
            },
            submit: "Sign Up",
            signin: "Already have an account? Sign in"
        },
        signin: {
            title: "Welcome Back",
            submit: "Sign In",
            signup: "New to Offering Bowl? Sign up"
        }
    },
    errors: {
        auth: {
            emailInUse:
                "This email is already registered. Please sign in or use a different email.",
            invalidEmail: "Please enter a valid email address.",
            operationNotAllowed: "Email/password accounts are not enabled. Please contact support.",
            weakPassword:
                "Please choose a stronger password. It should be at least 6 characters long.",
            userNotFound: "No account found with this email. Please sign up first.",
            wrongPassword: "Incorrect password. Please try again.",
            tooManyRequests: "Too many unsuccessful attempts. Please try again later.",
            default: "An unexpected error occurred. Please try again.",
            sessionExpired: "Your session has expired. Please sign in again.",
            network: "Unable to connect. Please check your connection and try again.",
            unknown: "Something went wrong. Please try signing in again.",
            retry: "Try Again"
        }
    },
    pending: {
        title: "Account Pending Approval",
        message:
            "Thank you for registering with Offering Bowl. Your profile is currently under review by our team.",
        whatNext: "What happens next?",
        steps: {
            email: "You will receive an email confirmation of your registration",
            review: "Our team will review your profile and verify your information",
            approval: "Once approved, you will receive access to your monastic dashboard"
        },
        logout: "Sign Out",
        support: "Questions? Contact us at"
    }
};
