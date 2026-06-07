import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { getLegalPageConfig } from '../config/legal-pages.config';

@Component({
  selector: 'app-legal-page',
  templateUrl: './legal-page.component.html',
  styleUrl: './legal-page.component.css',
})
export class LegalPageComponent implements OnInit {
  content = '';
  pageTitle = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const slug = this.route.snapshot.data['legalSlug'] as string;
    const config = getLegalPageConfig(slug);
    this.pageTitle = config?.title ?? 'Legal';
    this.content = this.route.snapshot.data['content'] ?? '';
  }
}
