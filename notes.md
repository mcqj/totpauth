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
- Don't import React and don't use React.FC. We are using React 19

### Prompt for creating PRDs
I am going to have our Product Managers create some product requirements documents. So that we can have consistency and great practices, I would like you to suggest the contents of the file prd-instructions.md that contains generalized instructions for our product requirements documents.

### Prompt for Creating Mock-ups
I am going to ask a ui designer to create mock ups for our product. So that we can have consistency and follow great practices, I would like you to suggest the contents of the file mockup-instructions.md that contains generalized instructions for our ui mockups. The mockups should be created using html, css and Javascript only. For each screen mockup, the html, css and JavaScript should be contained in a single file. mockup-instructions.md will be saved to the .github project folder.

### Prompt to create a auth product
Can you create a product requirements document for a product that will generate TOTP codes for a user to help them to login to applications that  use 2-factor authentication based on TOTP. The application should allow the user to add credentials for multiple applications. When an applications is being added, it will display a QR code and the user will used their device's camera to scan and decode the QR code to initialize the TOTP generator for that application.

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

### Implementer Instructions
You are a software engineer tasked with implementing the feature described in the file totp-authenticator-techspec.md. If anything is unclear, ask me questions before starting. You must complete all steps in the document. After finishing, verify that all steps are complete; if not, return and implement the missing steps. Repeat this process until all steps are done.

**V2**
You are a software engineer tasked with implementing the feature described in the file totp-authenticator-techspec.md. If anything is unclear, ask me questions before starting. You must complete all steps in the document. However, you should proceed step wise and give me an opportunity to confirm that the software works after each step.
After finishing, verify that all steps are complete; if not, return and implement the missing steps. Repeat this process until all steps are done.

Let's start by initializing Expo project with a bare bones App that is ready to be expanded with our desired functionality. But don't add our functionality until I've verified the App starts. To do that, you should run npx create-expo-app@latest

#### Follow Up
For V2, I used ChatGPT 4.1 with a custom Mode (see Beast Mode below). I also installed the **context7** MCP server as my earlier attempt had not installed the most recent version of Expo (v53 at time of writing).

I had two attempts with a slight mod to the prompt for the 2nd iteration - Copilot asked if I wanted to create a new subfolder for the App or create it from the root of the project. Initially, I said root of the project. This resulted in it not using the expo CLI to init the project and it creating the files manually. It resulted in various errors that caused a seemingly endless cycle of fixes. I abandoned ship and went for the sub-folder option, explicitly telling it to use `npx create-expo-app@latest` (list sentence of V2 prompt).

After executing the initial prompt, I tested the App to see if it ran and it didn't. There was a bit of back and forward of copying the errors into the chat window and getting Copilot to make fixes. After noticing repetitive errors getting fixed one by one, I asked Copilot to run lint and fix the lint errors, which speeded things up. I made sure I could run the App and see the home screen in the iOS emulator before proceeding.

The next step that the AI proposed was adding the add credential screen. It implemented the screen and asked if I wanted to test before continuing.

Again there were various errors to be corrected. When instructing it to fix an error, I asked it to look for similar errors and fix them as well and that seemed to improve the one by one nature of fixes. One error that came up was its use of a deprecated module. See below for a prompt that fixed that.

```
From what I'm reading on the web, expo-barcode-scanner is deprecated and does not work with expo version higher than 51. The recommendation is to migrate to expo-camera.
There are some details at this URL https://github.com/expo/fyi/blob/main/barcode-scanner-to-expo-camera.md
```

It changed the import and did some refactoring to use the alternative package and the App now ran again. Copilot hadn't provided a means to navigate to the new screen and so I asked for that. It tried to provide a button on the home screen but it didn't appear. Investigation showed it had been added to the wrong index.tsx file, the one in /app/(tabs) folder rather than the on in /app folder. In this case I told it the error and it fixed it.

After several more rounds of syntax errors and linting (I wonder if I can update Beast Mode to enforce linting after every edit), navigation worked and scanning a QR code worked.

We proceeded in this manner for several rounds, adding parsing of the QR code data, saving the data to SecureStore, adding a manual entry form, which was useful for debug, particularly in a simulator where camera scanning is not convenient. Manual entry was initially only available if a scan failed or on timeout. I asked for and received a button to activate it.

There was a failure in saving a credential from a scanned QR code. When told, Copilot added a debug modal to allow the details to be viewed. It turned out there were invalid characters in the **key** being used for secure store. The key was the name field coming from the QR and the one tested had spaces. When given the error, Copilot introduced some encoding of the key and we were good.

Next it proceeded to the credential list screen. Again, it failed to provide navigation but did inform me that it hadn't. It added that when prompted and told me that it had now completed the implementation of the tech spec.

At this point the App is not pretty and there are some usability issues but what is implemented does work. Copilot also suggested some next steps *"let me know if you want to add features like deleting credentials or showing TOTP codes"* which are good suggestions.

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



### Dealing with Training Cutoff Dates
LLM agents are trained at a point in time and may not have information about the latest version of a framework that we are using. So, we use tools in Agent mode to tell them how to get additional information. Tools can be accessed with `#` prompts.

For example - `#fetch URL` or mode completely:-

```
install tailwind css in this project. #fetch https://tailwindcss.com/docs/framework-guides/astro. Follow the instructions exactly.
```

### Learnings
It seems to be better to take a more step wise approach than big bang. Check the functionality after each step and get the AI to fix things or undo.

The AI makes mistakes and some are pretty obvious and bad, like accidentally deleting lines when it does an edit and breaking the code  - get it to lint the code after each step and fix lint errors.

One painful issue was the current working directory in the command window. Copilot was quite inconsistent about directory navigation. Sometimes, it issued a `cd expoapp` before running a command such as `npm install` and other times it didn't. When it did switch directories, it didn't switch back. An instruction to switch back was obeyed sometimes but not always. Another issue where it didn't seem to learn was that `--legacy-peer-deps` was needed but it always tried npm install without it and then tried again after a failure. These issues can probably be fixed with changes to copilot-instructions.md.

**Beast Mode** - VSCode's Copilot Chat now allows you to create custom modes. One such custom mode created by Burke Holland is what he calls Beast Mode. It's designed to work with ChatGPT 4.1, which is not a reasoning model. This mode provides instructions to make 4.1 reflect more and it seems to produce improved results. Most of the mode's instructions reflect ideas from [OpenAI's Cookbook on Coding](https://cookbook.openai.com/examples/gpt4-1_prompting_guide). You can find the Beast Mode [here](https://burkeholland.github.io/posts/beast-mode-3-1/).

**gpt-5** was released and VSCode got some updates to add it to the list of available models. It started
with gpt-5 mini as it has unlimited usage with GH copilot. It seems that the features of Beast Mode or
at least the most important ones are now rolled into VSCode's prompts. I used gpt-5 to implement some
UI Improvements and my general impression is that it does a bit better than gpt-4 (even with Beast Mode).
UI improvements included removing somewhat superfluous home screen and going straight to credential list,
switching text buttons to icons, adding snackbars and custom dialogs in place of alerts. An initial
attempt didn't go well when I allowed too many changes to be batched up. Proceeding with a more step
wise approach worked better.

Next I implemented scrolling of the list and Safe Areas. Scrolling worked
well; I had to interfere manually to get Safe Area working as copilot went around in circles. It then 
tried to refactor the safe area code into a common Screen component but introduced bugs with content
being hidden. It went around in circles again an I stopped it and parked that change.

I tried to get it to add unit testing with Jest and it struggled and circled again. I then pointed it
at the relevant page in the web site with instructions and asked it to only create a single hello
world test to validate the installation. It circled again so I stopped it and reverted changes. I
added unit testing manually by following the simple concise instructions on the web page and I didn't
have any issue so not sure why copilot couldn't make it work. Once I had the harness in place, I asked
it to propose a single test an implement and that went OK. The second test resulted in some infinite
rendering but it was able to fix that issue with only a couple of iterations.
