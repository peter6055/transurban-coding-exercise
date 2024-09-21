#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { TransurbanCodingExerciseStack } from '../lib/transurban-coding-exercise-stack';
import {BuildState} from "../types";

const app = new cdk.App();
new TransurbanCodingExerciseStack(app, 'TransurbanCodingExerciseStack', {}, BuildState.PROD);