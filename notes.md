## AI Coding Prompts

Can start in vscode by pulling up command prompt and typing new prompt file.
You can put in the project or in user data folder in VS Code so its available to all projects
Mode is in front-matter

In .github.prompts folder
- prd.prompt.md
- architect.prompt.md  (/architect ???)
- implement.prompt.md
- Copilot-instructions.md

Ask Agent to create docs in docs folder

### Product Manager
**PRD** - Use GPT 4.1 (or maybe Gemini?) to create the PRD - we have a general context `pre.prompt.md` to tell it generally how to do PRDs and then we can give it specific instructions for *this* prd
NB - need to tell get to edit files or it will just tell you what to do

### Architect
Gemini is good for the tech spec docs. Best at easy to follow steps. Can be a bit slower - rate limits more often.

### Software Engineer
4.1 is good at this and much faster than others. Be explicit.

#### References
https://humanwhocodes.com/blog/2025/06/persona-based-approach-ai-assisted-programming/


### Creating copilot instructions for a React Native Project 
Can you help me to create copilot instructions for a react-native expo project. You can refer to https://reactnative.dev/docs/environment-setup for latest react-native documentation and here for expo https://expo.dev/

- For navigation, we should use expo-router
- For styling, lets use nativewind
- Dont import React and don't use React.FC. We are using React 19

### Prompt for creating PRDs
I am going to have our Product Managers create some product requirements documents. So, that we can have consistency and great practices, I would like you to suggest the contents of the file prd-instructions.md that contains generalised instructions for our product requirements documents.

### Prompt for Creating Mock-ups
I am going to ask a ui designer to create mock ups for our product. So, that we can have consistency and follow great practices, I would like you to suggest the contents of the file mockup-instructions.md that contains generalised instructions for our ui mockups. The mockups should be created using html, css and Javascript only. For each screen mockup, the html, css and JavaScript should be contained in a single file. mockup-instructions.md will be saved to the .github project folder.

### Prompt to create a auth product
Can you create a product requirements document for a product that will generate TOTP codes for a user to help them to login to applications that  use 2-factor authentication based on TOTP. The application should allow the user to add credentials for multiple applications. When an applications is being added, it will display a QR code and the user will used their device's camera to scan and decode the QR code to initilaise the TOTP generator for that application.

### Prompt to create mock-ups for this product
Create initial set of mockups for the product in the ui-mockups folder
- Can you add a frame the mockups to make the UI look like an iPhone and add a navigation bar with some icons
- It looks like you only updated one of the three mockups to add the iphone frame and navigation bar

### Architect Instructions document
You are a software architect for this application. Your product manager has provided the attached
PRD outlining the functional requirements for a new product or product feature. Your task is to design
the implementation and ensure all acceptance criteria are met. Create a step-by-step guide detailing
how to implement your design. Include all details an LLM needs to implement this feature without
reading the PRD. DO NOT INCLUDE SOURCE CODE. If anything is unclear, ask me questions about the
PRD or implementation. If you need to make assumptions, state them clearly. Insert the design
into a Markdown file in the docs directory of the repository. The file should be named the same
as the PRD without “prd” in the name, with “techspec” instead. For example, if the PRD is
docs/saves-data-prd.md, the new file would be docs/saves-data-techspec.md. The file should be
formatted in Markdown and include headings and bullet points.

You may also refer to the html ui-mockups, if provided.

###nImplementer Instructions
You are a software engineer tasked with implementing the feature described in the attached file. If anything is unclear, ask me questions before starting. You must complete all steps in the document. After finishing, verify that all steps are complete; if not, return and implement the missing steps. Repeat this process until all steps are done.

### Questions and Answers

#### Questions
1. Should biometric authentication (Face ID/Touch ID) be included for app or credential access, or is this out of scope for the MVP?
2. Is onboarding (tutorial or first-time user flow) required for the initial release?
3. Should we plan for import/export of credentials, or is this not needed for now?
4. Are there any specific analytics or event tracking platforms you want integrated (e.g., Amplitude, Firebase Analytics), or should we use Expo’s built-in event logging?
5. Should the app support dark mode from the start, or is light mode sufficient for the MVP?

#### Answers
1. Leave out biometric authentication
2. Onboarding is not required
3. Import/export not required
4. There are no specific analytics or event tracking platforms required
5. Let's support dark mode from the start.
<<<<<<< Updated upstream:notes.md

### Dealing with Training Cutoff Dates

LLM agents are trained at a point in time and may not have information about the latest version of a framework that we are using. So, we use tools in Agent mode to tell them how to get additional information. Tools can be accessed with `#` prompts.

For example - `#fetch URL` or mode completely:-

```
install tailwind css in this project. #fetch https://tailwindcss.com/docs/framework-guides/astro. Follow the instructions exactly.
```
=======
>>>>>>> Stashed changes:notes
