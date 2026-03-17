import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EpisodeService } from '../../services/episode.service';
import { Episode } from '../../models/episode.model';
import { EpisodeFormComponent } from '../../components/episode-form/episode-form.component';
import { EpisodeViewComponent } from '../../components/episode-view/episode-view.component';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-episodes',
  standalone: true,
  imports: [CommonModule, FormsModule, EpisodeFormComponent, EpisodeViewComponent],
  templateUrl: './episodes.component.html',
  styleUrls: ['./episodes.component.scss']
})
export class EpisodesComponent implements OnInit {
  @ViewChild(EpisodeViewComponent) viewEpisodes!: EpisodeViewComponent;
  
  showForm = false;
  selectedEpisodeId: number | null = null;

  constructor(
    private episodeService: EpisodeService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {}

  onAddNew(): void {
    this.selectedEpisodeId = null;
    this.showForm = true;
  }

  onEdit(id: number): void {
    this.selectedEpisodeId = id;
    this.showForm = true;
  }

  onDelete(id: number): void {
    this.episodeService.delete(id).subscribe({
      next: () => {
        this.toastService.success('Episode deleted successfully', 30000);
        this.viewEpisodes.refresh();
      },
      error: (error) => {
        console.error('Error deleting episode:', error);
        this.toastService.error('Failed to delete episode', 30000);
      }
    });
  }

  onFormSubmitted(): void {
    this.showForm = false;
    this.selectedEpisodeId = null;
    this.viewEpisodes.refresh();
  }

  onFormCancelled(): void {
    this.showForm = false;
    this.selectedEpisodeId = null;
  }
}
