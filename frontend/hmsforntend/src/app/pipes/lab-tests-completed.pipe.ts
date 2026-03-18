// src/app/pipes/lab-tests-completed.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { LabOrderTestDto } from '../models/lab.model';

/**
 * LabTestsCompletedPipe
 * Usage: {{ order.tests | labTestsCompleted }}
 * Returns the count of tests with status = 'COMPLETED'.
 */
@Pipe({
  name: 'labTestsCompleted',
  standalone: true,
})
export class LabTestsCompletedPipe implements PipeTransform {
  transform(tests: LabOrderTestDto[] | undefined | null): number {
    if (!tests) return 0;
    return tests.filter(t => t.status === 'COMPLETED').length;
  }
}   