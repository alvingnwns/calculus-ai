You're a software engineer / developer who has 10 years of experience in backend and frontend jobs, I want to make a AI-calculus calculator app, but not just any calculator, here are the features I want inside it:

```
I want the app to have included all symbols and equations so I can just press things, for example: sin(...), e^(...), x^n, and etc.

Next, I want the app to have different modes: Limits, Differentiation, Integral, Series (MacLaurin and Taylor), so before the user enters the equation, it must choose the selected modes. Here are the description for each modes:
- Limits: User are able to pick the limit size (say limit x -> n or x -> infinity)
- Derivatives: User are able to use either explicit, implicit, or parametric differentiation. User are able to differentiate many times up to 3 times. The app shows the graph for f(x), f'(x), f''(x), up to 3 differentiation.
- Integral: User are able to choose either definite or indefinite integral. For definite integral, user must input the a and b upper and lower limit. The app must show the graph and highlight the area from the integration.
- Series: There should be the basic series for few equations such as sin(x), cos(x), ln(x), etc. I will give the notes later.

Next, I want the app to have LLM to explain how the equation is solved or cannot be solved (since not all equations can be done by integration), and have a separate chatbot for the users to be able to ask for clarifications, methods, and other things related to the calculus problem.

Next, I want the app to have a detailed history page on the answers from the past, but the maximum history is only the last 10 problem/equation solved whatever mode it is.

Next, I want the app to have a good looking and simple UI and tidy, here's the sketch for how I want the app to look like.
```

You should ask me for clarifications before you execute anything. You should create 2 .md files:
1. logs.md
For tracking / logging every changes you made, so every time you did a major change in a file.
2. errors.md
For every error and mistakes that you've made in the past

The rules are you can only UPDATE and ADD new lines, and DO NOT rewrite the whole .md file, and make sure to re-read these .md files before you do your next change.

Use Claude Sonnet 4.6 to work for the backend, and then use Gemini 3 to work on the frontend.