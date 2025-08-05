# Prompting Evaluation

This file contains ideas about different ways to try prompting the AI modesls.
It also contains
- notes about the reasoning for particular ways of prompting.
- notes about things that worked well and things that didn't
- how to use certain features of github copilot

## Failures

### Wrong Framework

First attempt with copilot tried to generate a React project rather than a React Native project
even though all of the various documents were very clear that it was React Native. The model's
commentary even said it was generating React Native.

Reason wasn't clear and not much was chaged for a later attempt that did do React Native.

## Wrong Version

The model generated code for an older out of date version of React Native / Expo.

Need to try to get the model to look at the latest version of documentation when generating.

## Very Few Features

A React Native App was generated but only had two simple pages with navigation but no real functionality
in each of those pages.

