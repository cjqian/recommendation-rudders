import { reverse, sortBy } from 'lodash';
import { ExpStageNames, Votes } from 'src/lib/staged-exp/data-model';

import { Component, computed, Signal } from '@angular/core';

import { SavedDataService } from '../services/saved-data.service';

@Component({
  selector: 'app-exp-leader-reveal',
  standalone: true,
  imports: [],
  templateUrl: './exp-leader-reveal.component.html',
  styleUrl: './exp-leader-reveal.component.scss',
})
export class ExpLeaderRevealComponent {
  public everyoneReachedTheEnd: Signal<boolean>;
  public finalLeader: Signal<string>;

  constructor(private dataService: SavedDataService) {
    this.everyoneReachedTheEnd = computed(() => {
      const users = Object.values(this.dataService.data().experiment.participants);
      return users.map((userData) => userData.futureStageNames.length).every((n) => n === 1);
    });

    this.finalLeader = computed(() => {
      const users = Object.values(this.dataService.data().experiment.participants);
      const votes: { [userId: string]: number } = {};
      users.forEach(({ userId }) => {
        votes[userId] = 0;
      });

      for (const user of users) {
        const leaderVotes = user.stageMap[ExpStageNames['6. Vote for the leader']].config as Votes;
        for (const userId of Object.keys(leaderVotes)) {
          const vote = leaderVotes[userId];
          if (vote === 'positive') {
            votes[userId] += 1;
          } else if (vote === 'negative') {
            votes[userId] -= 1;
          } else if (vote === 'neutral') {
            votes[userId] += 0;
          }
        }
      }

      const sorted = reverse(
        sortBy(
          Object.entries(votes).map(([userId, vote]) => ({ userId, vote })),
          ['vote'],
        ),
      );

      return sorted[0].userId;
    });
  }
}