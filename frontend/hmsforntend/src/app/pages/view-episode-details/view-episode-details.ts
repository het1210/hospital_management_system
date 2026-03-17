import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { EpisodeService } from '../../services/episode.service';
import { Episode } from '../../models/episode.model';
import { ChangeDetectorRef } from '@angular/core';

export interface EpisodeDetails {
  episodeDto: Episode;
  encounterDto: {
    id: number;
    episode: number;
    patientId: number;
    doctorId: number;
    doctorName: string;
    appointmentId: number;
    type: string;
    startTime: Date;
    endTime: Date;
  }[];
}

@Component({
  selector: 'app-view-episode-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-episode-details.html',
  styleUrls: ['./view-episode-details.scss']
})
export class ViewEpisodeDetails implements OnInit {
  episodeId: number | null = null;
  episodeDetails: EpisodeDetails | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private episodeService: EpisodeService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.episodeId = +id;
        console.log(this.episodeId);
        this.loadEpisodeDetails(this.episodeId);
      }
    });
  }

  loadEpisodeDetails(id: number) {
    console.log(`Loading details for episode ID: ${id}`);
    // In the future, fetch episode details by ID he
    this.episodeService.getById(id).subscribe({
      next: (response) => {
        this.episodeDetails = response.data;
        console.log(this.episodeDetails);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error(error);
      }
    })
  }

  goBack() {
    this.router.navigate(['/episode']);
  }
}
