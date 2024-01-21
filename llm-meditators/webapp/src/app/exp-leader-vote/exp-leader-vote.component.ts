/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an Apache2 license that can be
 * found in the LICENSE file and http://www.apache.org/licenses/LICENSE-2.0
==============================================================================*/

import { Component } from '@angular/core';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { SavedDataService } from '../services/saved-data.service';
import { LeaderVote } from '../../lib/staged-exp/data-model';

@Component({
  selector: 'app-exp-leader-vote',
  templateUrl: './exp-leader-vote.component.html',
  styleUrl: './exp-leader-vote.component.scss',
  standalone: true,
  imports: [MatRadioModule, MatButtonModule],
})
export class ExpLeaderVoteComponent {
  readonly LeaderVote = LeaderVote;
  public votes: { userId: string; vote: LeaderVote }[] = [
    { userId: 'user-1', vote: LeaderVote.NOT_RATED },
    { userId: 'user-2', vote: LeaderVote.NOT_RATED },
    { userId: 'user-3', vote: LeaderVote.NOT_RATED },
    { userId: 'user-4', vote: LeaderVote.NOT_RATED },
    { userId: 'user-5', vote: LeaderVote.NOT_RATED },
  ];

  constructor(private dataService: SavedDataService) {
    console.log(dataService);
  }

  setVote(event: unknown, userId: string) {
    const { value } = event as { value: LeaderVote };
    const voteIndex = this.votes.findIndex((v) => v.userId === userId);
    if (voteIndex === -1) {
      throw new Error(`User ${userId} not found in votes.`);
    }
    this.votes[voteIndex].vote = value;
    console.log(this.votes);
    // TODO: set votes in dataService
  }

  resetVote(userId: string) {
    const voteIndex = this.votes.findIndex((v) => v.userId === userId);
    if (voteIndex === -1) {
      throw new Error(`User ${userId} not found in votes.`);
    }
    this.votes[voteIndex].vote = LeaderVote.NOT_RATED;
    console.log(this.votes);
    // TODO: set votes in dataService
  }
}
