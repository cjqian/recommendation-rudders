/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an Apache2 license that can be
 * found in the LICENSE file and http://www.apache.org/licenses/LICENSE-2.0
==============================================================================*/

import {
  computed,
  effect,
  Injectable,
  Signal,
  signal,
  untracked,
  WritableSignal,
} from '@angular/core';
import { LmApiService } from './lm-api.service';
import {
  Experiment,
  ExpStage,
  UserData,
  ExpDataKinds,
  UserProfile,
  ChatAboutItems,
  STAGE_KIND_SURVEY,
  ExpStageKind,
  GenericExpStage,
} from '../../lib/staged-exp/data-model';
import { initialExperimentSetup } from '../../lib/staged-exp/example-experiment';
import { ActivatedRoute, Params, Router, UrlSegment } from '@angular/router';
import * as _ from 'underscore';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { Session } from 'src/lib/session';
import {
  AppSettings,
  AppState,
  APPSTATE_PARTICIPANT,
  initAppState,
  initialAppData,
  SavedAppData,
} from 'src/lib/app';
import { Participant } from 'src/lib/participant';

// function urlPathVarMatcher(segments: UrlSegment[]);

// -------------------------------------------------------------------------------------
//  The App State Service...
// -------------------------------------------------------------------------------------
@Injectable({
  providedIn: 'root',
})
export class AppStateService {
  public data: WritableSignal<SavedAppData>;

  public state: WritableSignal<AppState> = signal(initAppState);

  // About the app itself.
  public appName: Signal<string>;
  public dataSize: Signal<number>;
  public dataJson: Signal<string>;

  // Any errors.
  public errors: WritableSignal<string[]>;

  constructor(
    private lmApiService: LmApiService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    // this.route.url.forEach((urlFragments) => {
    //   if (urlFragments.length === 0) {
    //     this.state.set(initAppState);
    //     return;
    //   } else if (urlFragments[0].path === 'participant') {
    //     if(this.state().kind === APPSTATE_PARTICIPANT)
    //   }
    // });

    // The data.
    this.data = signal(
      JSON.parse(localStorage.getItem('data') || JSON.stringify(initialAppData())),
    );

    // Convenience signal for the appName.
    this.appName = computed(() => this.data().settings.name);
    this.dataJson = computed(() => JSON.stringify(this.data()));
    this.dataSize = computed(() => this.dataJson().length);
    this.errors = signal([]);

    // Save whenever data changes.
    effect(() => {
      localStorage.setItem('data', this.dataJson());
    });
  }

  // TODO: do some magic to make the type T get inferred from stageKind.
  getParticipantAndStage<K extends ExpStage['kind'], T extends ExpStage & { kind: K }>(
    stageKind: K,
  ): {
    participant: Participant;
    stageData: Signal<T extends GenericExpStage<infer Kind> ? Kind : never>;
  } {
    const appState = this.state();
    if (appState.kind !== APPSTATE_PARTICIPANT) {
      throw new Error(`ParticipantStageViewComponent participant state`);
    }
    const participant = appState.particpant;

    const stageData = computed(() => {
      const stage = participant.viewingStage();
      if (stage.kind !== stageKind) {
        throw new Error(`incorrect stage: ${stage.kind}.`);
      }
      return stage.config as T extends GenericExpStage<infer Kind> ? Kind : never;
    });
    return { stageData, participant };
  }

  setSetting(settingKey: keyof AppSettings, settingValue: string) {
    const data = this.data();
    if (data.settings[settingKey] !== settingValue) {
      data.settings[settingKey] = settingValue;
      this.data.set({ ...data });
    }
  }

  reset() {
    this.data.set(initialAppData());
  }
}